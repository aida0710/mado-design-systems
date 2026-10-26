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

export interface RequestJsonOptions<Schema extends z.ZodType> {
  /** 成功の応答の本文の形。204（本文なし）を返すAPIは`z.undefined()`を渡す。 */
  schema: Schema;
  init?: RequestInit;
  /** 401のときに呼ぶ（ログイン画面へ戻すなど）。呼んだ後もApiErrorを投げる。 */
  onUnauthorized?: () => void;
}

/**
 * APIを呼び、本文を`schema`で確かめて返す。失敗の応答・通信の失敗・形の合わない本文はApiErrorにする。
 * 呼び出しを止めた（AbortSignal）ときは、ブラウザのAbortErrorをそのまま投げる。
 */
export async function requestJson<Schema extends z.ZodType>(
  input: string,
  { schema, init, onUnauthorized }: RequestJsonOptions<Schema>,
): Promise<z.infer<Schema>> {
  let response: Response;
  try {
    response = await fetch(input, { credentials: 'include', ...init });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    throw new ApiError({
      status: 0,
      code: NETWORK_ERROR_CODE,
      message: error instanceof Error ? error.message : 'Network request failed',
    });
  }
  if (response.status === HTTP_UNAUTHORIZED) onUnauthorized?.();
  const payload: unknown = response.status === HTTP_NO_CONTENT ? undefined : await response.json().catch(() => undefined);
  if (!response.ok) throw apiErrorFromResponse(response.status, response.statusText, payload);
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

/** JSONの本文を送る要求の設定。 */
export function jsonRequestInit(method: 'POST' | 'PUT' | 'PATCH' | 'DELETE', body?: unknown): RequestInit {
  return body === undefined
    ? { method }
    : { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) };
}

/** cursorで分けた一覧の1ページ（MMT・DCの両方の一覧の形）。 */
export function cursorPageSchema<Item extends z.ZodType>(item: Item) {
  return z.object({ items: z.array(item), nextCursor: z.string().nullable() });
}
