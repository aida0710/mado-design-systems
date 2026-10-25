/*
 * The display language: the one the user picked and saved, else the browser's preferred language,
 * else English. Each app keeps its own store under its own storage key, so picking a language in
 * one app does not change the other.
 */
import { readStorage, writeStorage } from './storage';

export type Locale = 'en' | 'ja';

/** Each language under its own name, so users find theirs whatever the current language is. */
export const LANGUAGES: ReadonlyArray<{ locale: Locale; name: string }> = [
  { locale: 'ja', name: '日本語' },
  { locale: 'en', name: 'English' },
];

// Used when the browser gives no language or none that the apps support.
const FALLBACK_LOCALE: Locale = 'en';

const INTL_LOCALES: Record<Locale, string> = { en: 'en-US', ja: 'ja-JP' };

export function isLocale(value: unknown): value is Locale {
  return value === 'en' || value === 'ja';
}

function browserLocale(): Locale | null {
  if (typeof navigator === 'undefined') return null;
  const languages = navigator.languages?.length ? navigator.languages : [navigator.language];
  for (const language of languages) {
    const supported = language?.split('-')[0];
    if (isLocale(supported)) return supported;
  }
  return null;
}

export interface LocaleStore {
  getLocale: () => Locale;
  /** The locale for Intl formatters, such as 'ja-JP'. */
  getIntlLocale: () => string;
  /** Changes the language and saves it as the user's pick. */
  setLocale: (next: Locale) => void;
  /** Calls `listener` whenever the language changes, also when another tab changes it. */
  subscribe: (listener: () => void) => () => void;
  /** Writes the language to <html lang>. Call once before the first render. */
  applyToDocument: () => void;
}

export function createLocaleStore({ storageKey }: { storageKey: string }): LocaleStore {
  const listeners = new Set<() => void>();
  const readInitialLocale = (): Locale => {
    const stored = readStorage(storageKey);
    return isLocale(stored) ? stored : (browserLocale() ?? FALLBACK_LOCALE);
  };
  let locale = readInitialLocale();

  const update = (next: Locale) => {
    if (typeof document !== 'undefined') document.documentElement.lang = next;
    if (next === locale) return;
    locale = next;
    listeners.forEach((listener) => listener());
  };
  const syncFromOtherTab = (event: StorageEvent) => {
    // A null key means another tab cleared the whole storage.
    if (event.key !== storageKey && event.key !== null) return;
    update(readInitialLocale());
  };

  return {
    getLocale: () => locale,
    getIntlLocale: () => INTL_LOCALES[locale],
    setLocale: (next) => {
      update(next);
      writeStorage(storageKey, next);
    },
    subscribe: (listener) => {
      if (listeners.size === 0 && typeof window !== 'undefined') {
        window.addEventListener('storage', syncFromOtherTab);
      }
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
        if (listeners.size === 0 && typeof window !== 'undefined') {
          window.removeEventListener('storage', syncFromOtherTab);
        }
      };
    },
    applyToDocument: () => {
      document.documentElement.lang = locale;
    },
  };
}
