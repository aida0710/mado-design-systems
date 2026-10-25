/*
 * ライトテーマとダークテーマ。テーマを<html data-theme>に書くと、tokens.cssの色が切り替わる。
 * 利用者が選ぶまでは、ページはOSの設定に従う。
 */
import { readStorage, writeStorage } from './storage';

export type Theme = 'light' | 'dark';

/** `storageKey`に保存したテーマ。無ければOSの設定。 */
export function initialTheme(storageKey: string): Theme {
  const stored = readStorage(storageKey);
  if (stored === 'light' || stored === 'dark') return stored;
  return typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

/** 利用者が選んだテーマを保存する。明示的に選んだときだけ保存するので、それまではOSの設定が効く。 */
export function saveTheme(storageKey: string, theme: Theme): void {
  writeStorage(storageKey, theme);
}

/** <html data-theme>にあるテーマ。 */
export function readDocumentTheme(): Theme {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}
