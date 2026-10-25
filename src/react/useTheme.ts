import { useEffect, useState } from 'react';
import { initialTheme, readDocumentTheme, saveTheme, type Theme } from '../theme';

/** ライト・ダークの切り替え。テーマを<html data-theme>に書き、利用者が選んだテーマを保存する。 */
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
 * useThemeが<html>に書いたテーマ。CSSの変数を使えない描画（canvas、Monaco）のためのもの。
 * 属性を監視するので、上部バーでテーマを切り替えると描き直す。
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
