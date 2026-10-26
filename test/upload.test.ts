import { afterEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { NETWORK_ERROR_CODE, cursorPageSchema, jsonRequestInit, uploadWithProgress } from '../src/http';

/** 送る・進む・応答する・失敗する・止めるを、テストから順に起こせるXMLHttpRequestの代わり。 */
class FakeXhr {
  static last: FakeXhr;
  status = 0;
  statusText = '';
  responseText = '';
  withCredentials = false;
  headers: Record<string, string> = {};
  upload: { onprogress: ((event: { loaded: number }) => void) | null } = { onprogress: null };
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  onabort: (() => void) | null = null;
  constructor() {
    FakeXhr.last = this;
  }
  open() {}
  setRequestHeader(name: string, value: string) {
    this.headers[name] = value;
  }
  send() {}
  abort() {
    this.onabort?.();
  }
  respond(status: number, body: unknown) {
    this.status = status;
    this.responseText = body === undefined ? '' : JSON.stringify(body);
    this.onload?.();
  }
}

afterEach(() => vi.unstubAllGlobals());

describe('uploadWithProgress', () => {
  it('進み具合を知らせ、応答をスキーマで確かめて返す', async () => {
    vi.stubGlobal('XMLHttpRequest', FakeXhr);
    const sent: number[] = [];
    const done = uploadWithProgress({ url: '/api/u', body: new Blob(['abc']), schema: z.object({ etag: z.string() }), onProgress: (n) => sent.push(n) });
    FakeXhr.last.upload.onprogress?.({ loaded: 2 });
    FakeXhr.last.respond(200, { etag: 'x' });
    await expect(done).resolves.toEqual({ etag: 'x' });
    expect(sent).toEqual([2]);
    expect(FakeXhr.last.withCredentials).toBe(true);
  });

  it('失敗の応答はAPIの文のApiError、通信の失敗はnetwork_error', async () => {
    vi.stubGlobal('XMLHttpRequest', FakeXhr);
    const failed = uploadWithProgress({ url: '/api/u', body: new Blob([]), schema: z.unknown() });
    FakeXhr.last.respond(409, { error: 'part already uploaded', code: 'conflict' });
    await expect(failed).rejects.toMatchObject({ status: 409, code: 'conflict', message: 'part already uploaded' });
    const offline = uploadWithProgress({ url: '/api/u', body: new Blob([]), schema: z.unknown() });
    FakeXhr.last.onerror?.();
    await expect(offline).rejects.toMatchObject({ code: NETWORK_ERROR_CODE });
  });

  it('止めたときは止めた理由を投げる', async () => {
    vi.stubGlobal('XMLHttpRequest', FakeXhr);
    const controller = new AbortController();
    const upload = uploadWithProgress({ url: '/api/u', body: new Blob([]), schema: z.unknown(), signal: controller.signal });
    const reason = new Error('cancelled by user');
    controller.abort(reason);
    await expect(upload).rejects.toBe(reason);
  });
});

describe('jsonRequestInit と cursorPageSchema', () => {
  it('signalを渡せ、本文が無ければヘッダーも付けない', () => {
    const controller = new AbortController();
    expect(jsonRequestInit('POST', { a: 1 }, { signal: controller.signal })).toMatchObject({ method: 'POST', signal: controller.signal, body: '{"a":1}' });
    expect(jsonRequestInit('DELETE')).toEqual({ method: 'DELETE' });
  });

  it('一覧のページは契約に無い項目を通さない', () => {
    const page = cursorPageSchema(z.string());
    expect(page.safeParse({ items: ['a'], nextCursor: null }).success).toBe(true);
    expect(page.safeParse({ items: ['a'], nextCursor: null, extra: 1 }).success).toBe(false);
  });
});
