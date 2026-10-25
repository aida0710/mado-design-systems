/*
 * 表示言語。利用者が選んで保存した言語、無ければブラウザの優先言語、それも無ければ英語。
 * 各アプリは自分の保存キーで別々のストアを持つので、一方のアプリで言語を選んでも、もう一方は
 * 変わらない。
 */
import { readStorage, writeStorage } from './storage';

export type Locale = 'en' | 'ja';

/**
 * 各言語をその言語自身の名前で並べる。今の表示言語が何であっても、利用者が自分の言語を
 * 見つけられるように。
 */
export const LANGUAGES: ReadonlyArray<{ locale: Locale; name: string }> = [
  { locale: 'ja', name: '日本語' },
  { locale: 'en', name: 'English' },
];

// ブラウザが言語を返さないか、アプリが対応する言語が無いときに使う。
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
  /** Intlのフォーマッターに渡すロケール（'ja-JP'など）。 */
  getIntlLocale: () => string;
  /** 言語を変え、利用者が選んだものとして保存する。 */
  setLocale: (next: Locale) => void;
  /** 言語が変わるたびに`listener`を呼ぶ。ほかのタブで変えたときも呼ぶ。 */
  subscribe: (listener: () => void) => () => void;
  /** 言語を<html lang>に書く。最初の描画の前に1回呼ぶ。 */
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
    // keyがnullなら、ほかのタブがストレージ全体を消した。
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
