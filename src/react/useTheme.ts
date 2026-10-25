import { useEffect, useState } from 'react';
import { initialTheme, readDocumentTheme, saveTheme, type Theme } from '../theme';

/** The light/dark switch. Writes the theme to <html data-theme>; the user's pick is saved. */
export function useTheme({ storageKey }: { storageKey: string }): { theme: Theme; toggle: () => void } {
  const [theme, setTheme] = useState<Theme>(() => initialTheme(storageKey));
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);
  const toggle = () => {
    const next: Theme = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    saveTheme(storageKey, next);
  };
  return { theme, toggle };
}

/**
 * The theme useTheme wrote to <html>, for drawing that cannot use CSS variables (canvas, Monaco).
 * It watches the attribute, so switching the theme in the header renders again.
 */
export function useDocumentTheme(): Theme {
  const [theme, setTheme] = useState<Theme>(readDocumentTheme);
  useEffect(() => {
    const observer = new MutationObserver(() => setTheme(readDocumentTheme()));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);
  return theme;
}
