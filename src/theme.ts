/*
 * The light and dark themes. Writing the theme to <html data-theme> switches the colors of
 * tokens.css. Until the user picks one, the page follows the OS setting.
 */
import { readStorage, writeStorage } from './storage';

export type Theme = 'light' | 'dark';

/** The theme saved under `storageKey`, else the OS setting. */
export function initialTheme(storageKey: string): Theme {
  const stored = readStorage(storageKey);
  if (stored === 'light' || stored === 'dark') return stored;
  return typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

/** Saves the user's pick. Only an explicit pick is saved, so the OS setting applies until then. */
export function saveTheme(storageKey: string, theme: Theme): void {
  writeStorage(storageKey, theme);
}

/** The theme on <html data-theme>. */
export function readDocumentTheme(): Theme {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}
