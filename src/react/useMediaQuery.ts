import { useCallback, useSyncExternalStore } from 'react';

const canMatchMedia = () => typeof window !== 'undefined' && typeof window.matchMedia === 'function';

/**
 * メディアクエリに当てはまるか。画面が変わるたびに描き直す。matchMediaが無い環境（サーバーでの
 * 描画、古いテスト環境）ではfalseになり、広い画面のレイアウトが既定になる。
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      if (!canMatchMedia()) return () => {};
      const list = window.matchMedia(query);
      list.addEventListener('change', onChange);
      return () => list.removeEventListener('change', onChange);
    },
    [query],
  );
  return useSyncExternalStore(
    subscribe,
    () => canMatchMedia() && window.matchMedia(query).matches,
    () => false,
  );
}
