/*
 * 両アプリのAPIの呼び出し。応答はzodのスキーマで確かめ、失敗はAPIの本文（`{ error, code, ...値 }`）を
 * そのまま持つApiErrorにする。画面はApiErrorのmessage（APIの文）をそのまま出す。訳す層は持たない。
 */
import { z } from 'zod';

/** APIに届かなかった（通信の失敗）。 */
export const NETWORK_ERROR_CODE = 'network_error';
/** 応答の本文がスキーマに合わない。 */
export const INVALID_RESPONSE_CODE = 'invalid_response';

const HTTP_NO_CONTENT = 204;
const HTTP_UNAUTHORIZED = 401;
const HTTP_NOT_FOUND = 404;

/** APIのエラー応答の本文。error・codeの横の項目は、文に入る値（理由・対象など）。 */
export const ApiErrorBodySchema = z.looseObject({ error: z.string(), code: z.string().optional() });

/** 失敗したAPIの呼び出し。messageはAPIの文で、画面にそのまま出す。 */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string | undefined;
  /** 本文のerror・codeの横の項目。 */
  readonly details: Readonly<Record<string, unknown>>;

  constructor({
    status,
    message,
    code,
    details = {},
  }: {
    status: number;
    message: string;
    code?: string;
    details?: Readonly<Record<string, unknown>>;
  }) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

/** 失敗の応答からApiErrorを作る。APIの形でない本文（手前のプロキシのHTML、空）ならHTTPの状態を文にする。 */
export function apiErrorFromResponse(status: number, statusText: string, body: unknown): ApiError {
  const parsed = ApiErrorBodySchema.safeParse(body);
  if (!parsed.success) return new ApiError({ status, message: `HTTP ${status}${statusText ? ` ${statusText}` : ''}` });
  const { error, code, ...details } = parsed.data;
  return new ApiError({ status, message: error, code, details });
}

export function isApiError(failure: unknown): failure is ApiError {
  return failure instanceof ApiError;
}

/** 対象が無い、別の場所に属する、または利用者から隠されている（404）。 */
export function isNotFoundError(failure: unknown): boolean {
  return isApiError(failure) && failure.status === HTTP_NOT_FOUND;
}

/** 401（ログインしていない・セッションが切れた）。 */
export function isUnauthorizedError(failure: unknown): boolean {
  return isApiError(failure) && failure.status === HTTP_UNAUTHORIZED;
}

export interface SendOptions {
  init?: RequestInit;
  /** 401のときに呼ぶ（ログイン画面へ戻すなど）。呼んだ後もApiErrorを投げる。 */
  onUnauthorized?: () => void;
}

export interface RequestJsonOptions<Schema extends z.ZodType> extends SendOptions {
  /** 成功の応答の本文の形。204（本文なし）を返すAPIは`z.undefined()`を渡す。 */
  schema: Schema;
}

/** fetchし、通信の失敗をApiErrorにする。呼び出しを止めたとき（AbortSignal）は、止めた理由をそのまま投げる。 */
async function send(input: string, { init, onUnauthorized }: SendOptions): Promise<Response> {
  let response: Response;
  try {
    response = await fetch(input, { credentials: 'include', ...init });
  } catch (error) {
    // abort(reason)で止めると、AbortErrorでなく渡した理由で失敗するので、signalの状態で見分ける。
    if (init?.signal?.aborted || (error instanceof DOMException && error.name === 'AbortError')) throw error;
    throw new ApiError({
      status: 0,
      code: NETWORK_ERROR_CODE,
      message: error instanceof Error ? error.message : 'Network request failed',
    });
  }
  if (response.status === HTTP_UNAUTHORIZED) onUnauthorized?.();
  return response;
}

/**
 * APIを呼び、成功ならResponseをそのまま返す。本文を流したまま読む・Blobにする・HEADで見るなど、
 * JSONとして読まない呼び出し用。失敗の応答と通信の失敗はApiErrorにする。
 */
export async function fetchResponse(input: string, options: SendOptions = {}): Promise<Response> {
  const response = await send(input, options);
  if (response.ok) return response;
  const payload: unknown = await response.json().catch(() => undefined);
  throw apiErrorFromResponse(response.status, response.statusText, payload);
}

/**
 * APIを呼び、本文を`schema`で確かめて返す。失敗の応答・通信の失敗・形の合わない本文はApiErrorにする。
 */
export async function requestJson<Schema extends z.ZodType>(
  input: string,
  { schema, ...options }: RequestJsonOptions<Schema>,
): Promise<z.infer<Schema>> {
  const response = await fetchResponse(input, options);
  const payload: unknown = response.status === HTTP_NO_CONTENT ? undefined : await response.json().catch(() => undefined);
  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    throw new ApiError({
      status: response.status,
      code: INVALID_RESPONSE_CODE,
      message: `Unexpected response from ${new URL(input, 'http://localhost').pathname}: ${z.prettifyError(parsed.error)}`,
    });
  }
  return parsed.data;
}

/** JSONの本文を送る要求の設定。止めたい呼び出しは`signal`を渡す。 */
export function jsonRequestInit(
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  body?: unknown,
  { signal }: { signal?: AbortSignal } = {},
): RequestInit {
  const base: RequestInit = signal ? { method, signal } : { method };
  return body === undefined
    ? base
    : { ...base, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) };
}

/**
 * cursorで分けた一覧の1ページ（MMT・DCの両方の一覧の形）。契約に無い項目は通さない（APIの形が
 * 変わったことに気づけるように）。
 */
export function cursorPageSchema<Item extends z.ZodType>(item: Item) {
  return z.strictObject({ items: z.array(item), nextCursor: z.string().nullable() });
}

export interface UploadWithProgressOptions<Schema extends z.ZodType> {
  url: string;
  method?: 'PUT' | 'POST';
  body: Blob | ArrayBuffer | FormData;
  headers?: Record<string, string>;
  /** 成功の応答の本文の形。 */
  schema: Schema;
  signal?: AbortSignal;
  /** 要求の本文のうち、ここまでに送ったバイト数。 */
  onProgress?: (sentBytes: number) => void;
  onUnauthorized?: () => void;
}

/**
 * 進み具合を知らせながら本文を送る。fetchは送信の進み具合を知らせられないので、XMLHttpRequestを使う。
 * 応答はrequestJsonと同じくスキーマで確かめ、失敗の応答と通信の失敗はApiErrorにする。止めたときは
 * 止めた理由（無ければAbortError）を投げる。
 */
export function uploadWithProgress<Schema extends z.ZodType>({
  url,
  method = 'PUT',
  body,
  headers = {},
  schema,
  signal,
  onProgress,
  onUnauthorized,
}: UploadWithProgressOptions<Schema>): Promise<z.infer<Schema>> {
  const abortReason = () => signal?.reason ?? new DOMException('Upload aborted', 'AbortError');
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(abortReason());
      return;
    }
    const xhr = new XMLHttpRequest();
    const abort = () => xhr.abort();
    signal?.addEventListener('abort', abort, { once: true });
    const settle = (finish: () => void) => {
      signal?.removeEventListener('abort', abort);
      finish();
    };
    xhr.open(method, url);
    xhr.withCredentials = true;
    for (const [name, value] of Object.entries(headers)) xhr.setRequestHeader(name, value);
    if (onProgress) xhr.upload.onprogress = (event) => onProgress(event.loaded);
    xhr.onabort = () => settle(() => reject(abortReason()));
    xhr.onerror = () =>
      settle(() => reject(new ApiError({ status: 0, code: NETWORK_ERROR_CODE, message: 'Upload request failed' })));
    xhr.onload = () =>
      settle(() => {
        if (xhr.status === HTTP_UNAUTHORIZED) onUnauthorized?.();
        const payload = parseJsonOrUndefined(xhr.responseText);
        if (xhr.status < 200 || xhr.status >= 300) {
          reject(apiErrorFromResponse(xhr.status, xhr.statusText, payload));
          return;
        }
        const parsed = schema.safeParse(xhr.status === HTTP_NO_CONTENT ? undefined : payload);
        if (parsed.success) resolve(parsed.data);
        else
          reject(
            new ApiError({
              status: xhr.status,
              code: INVALID_RESPONSE_CODE,
              message: `Unexpected response from ${new URL(url, 'http://localhost').pathname}: ${z.prettifyError(parsed.error)}`,
            }),
          );
      });
    xhr.send(body);
  });
}

function parseJsonOrUndefined(text: string): unknown {
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}
