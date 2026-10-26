import { afterEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { ApiError, INVALID_RESPONSE_CODE, NETWORK_ERROR_CODE, isNotFoundError, requestJson } from '../src/http';

const respond = (status: number, body?: unknown, statusText = '') =>
  vi.stubGlobal(
    'fetch',
    vi.fn(async () =>
      new Response(body === undefined ? null : typeof body === 'string' ? body : JSON.stringify(body), { status, statusText }),
    ),
  );

afterEach(() => vi.unstubAllGlobals());

describe('requestJson', () => {
  it('本文をスキーマで確かめて返す', async () => {
    respond(200, { name: 'a', extra: 1 });
    await expect(requestJson('/api/x', { schema: z.object({ name: z.string() }) })).resolves.toEqual({ name: 'a' });
  });

  it('204はundefinedをスキーマに渡す', async () => {
    respond(204);
    await expect(requestJson('/api/x', { schema: z.undefined() })).resolves.toBeUndefined();
  });

  it('失敗の応答はAPIの文をそのままmessageにし、codeと値を持つ', async () => {
    respond(409, { error: 'Name already exists', code: 'already_exists', name: 'a' });
    const failure = await requestJson('/api/x', { schema: z.unknown() }).catch((error: unknown) => error);
    expect(failure).toBeInstanceOf(ApiError);
    expect(failure).toMatchObject({ status: 409, code: 'already_exists', message: 'Name already exists', details: { name: 'a' } });
  });

  it('APIの形でない失敗の本文はHTTPの状態を文にする', async () => {
    respond(502, '<html>Bad Gateway</html>', 'Bad Gateway');
    await expect(requestJson('/api/x', { schema: z.unknown() })).rejects.toMatchObject({ status: 502, message: 'HTTP 502 Bad Gateway', code: undefined });
  });

  it('形の合わない本文はinvalid_responseにする', async () => {
    respond(200, { name: 1 });
    await expect(requestJson('/api/x', { schema: z.object({ name: z.string() }) })).rejects.toMatchObject({ code: INVALID_RESPONSE_CODE });
  });

  it('通信の失敗はnetwork_errorにし、止めた呼び出しはAbortErrorのまま', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new TypeError('fetch failed'); }));
    await expect(requestJson('/api/x', { schema: z.unknown() })).rejects.toMatchObject({ status: 0, code: NETWORK_ERROR_CODE });
    vi.stubGlobal('fetch', vi.fn(async () => { throw new DOMException('aborted', 'AbortError'); }));
    await expect(requestJson('/api/x', { schema: z.unknown() })).rejects.toMatchObject({ name: 'AbortError' });
  });

  it('401ならonUnauthorizedを呼んでから投げる', async () => {
    respond(401, { error: 'authentication required', code: 'authentication_required' });
    const onUnauthorized = vi.fn();
    const failure = await requestJson('/api/x', { schema: z.unknown(), onUnauthorized }).catch((error: unknown) => error);
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
    expect(failure).toMatchObject({ status: 401, code: 'authentication_required' });
    respond(404, { error: 'not found', code: 'not_found' });
    expect(isNotFoundError(await requestJson('/api/x', { schema: z.unknown() }).catch((error: unknown) => error))).toBe(true);
  });
});
