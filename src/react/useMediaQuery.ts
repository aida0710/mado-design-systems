import { useCallback, useSyncExternalStore } from 'react';

const canMatchMedia = () => typeof window !== 'undefined' && typeof window.matchMedia === 'function';

/**
 * Whether the media query matches, rendering again whenever the screen changes. Without matchMedia
 * (server rendering, old test environments) it is false, so the wide layout is the default.
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
