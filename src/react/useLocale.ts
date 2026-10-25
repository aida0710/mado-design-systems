import { useSyncExternalStore } from 'react';
import type { Locale, LocaleStore } from '../locale';

/** The display language of `store`; the component renders again when it changes. */
export function useLocale(store: LocaleStore): { locale: Locale; setLocale: (next: Locale) => void } {
  const locale = useSyncExternalStore(store.subscribe, store.getLocale, store.getLocale);
  return { locale, setLocale: store.setLocale };
}
