import { useCallback, useEffect, useRef, useState } from 'react';

export interface QueryState<T> {
  value: T | undefined;
  loading: boolean;
  /** 最後の読み込みで投げられたもの。文言にするのはアプリ（エラーの形がアプリごとに違うため）。 */
  error: unknown;
  reload: () => void;
}

/**
 * `key`ごとにデータを読み込む。keyが変わると前の読み込みを止め（AbortSignal）、前のkeyの値は
 * 出さない。`pollMs`を渡すと、読み込みが終わるたびにその間隔で読み直す。keyがnullの間は読まない。
 */
export function useQuery<T>({
  key,
  load,
  pollMs,
}: {
  key: string | null;
  load: (signal: AbortSignal) => Promise<T>;
  pollMs?: number;
}): QueryState<T> {
  const loadRef = useRef(load);
  loadRef.current = load;
  const [revision, setRevision] = useState(0);
  const [state, setState] = useState<{
    key: string | null;
    value?: T;
    loading: boolean;
    failure: { cause: unknown } | null;
  }>({ key: null, loading: true, failure: null });
  const reload = useCallback(() => setRevision((value) => value + 1), []);

  useEffect(() => {
    if (!key) {
      setState({ key, loading: false, failure: null });
      return;
    }
    const controller = new AbortController();
    // 同じkeyの読み直しでは、読み終わるまで前の値を出したままにする。
    setState((previous) => ({
      key,
      value: previous.key === key ? previous.value : undefined,
      loading: true,
      failure: null,
    }));
    let timer: ReturnType<typeof setTimeout> | undefined;
    const run = async () => {
      try {
        const value = await loadRef.current(controller.signal);
        if (!controller.signal.aborted) setState({ key, value, loading: false, failure: null });
      } catch (cause) {
        if (!controller.signal.aborted) setState({ key, loading: false, failure: { cause } });
      }
      if (!controller.signal.aborted && pollMs) timer = setTimeout(run, pollMs);
    };
    void run();
    return () => {
      controller.abort();
      if (timer) clearTimeout(timer);
    };
  }, [key, revision, pollMs]);

  return {
    value: state.key === key ? state.value : undefined,
    loading: state.key !== key || state.loading,
    error: state.key === key && state.failure ? state.failure.cause : null,
    reload,
  };
}
