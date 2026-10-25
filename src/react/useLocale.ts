import { useSyncExternalStore } from 'react';
import type { Locale, LocaleStore } from '../locale.js';

/** `store`の表示言語。変わると部品を描き直す。 */
export function useLocale(store: LocaleStore): { locale: Locale; setLocale: (next: Locale) => void } {
  const locale = useSyncExternalStore(store.subscribe, store.getLocale, store.getLocale);
  return { locale, setLocale: store.setLocale };
}
