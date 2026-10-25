/*
 * tokens.cssの色で作るMonaco Editorのテーマ。MonacoはCSSの変数を解決できないので、値は
 * getComputedStyleでルート要素から読む。Monacoのモジュールはアプリが渡すので、このパッケージは
 * monaco-editorを含まない。
 */
import type { Theme } from './theme.js';

/** テーマに必要な`monaco.editor`の部分。 */
export interface MonacoThemeRegistry {
  defineTheme: (
    name: string,
    data: {
      base: 'vs' | 'vs-dark';
      inherit: boolean;
      rules: [];
      colors: Record<string, string>;
    },
  ) => void;
}

export const MONACO_THEME_NAMES: Record<Theme, string> = { light: 'mado-light', dark: 'mado-dark' };

/** トークンの色（#rgbか#rrggbb）を#rrggbbにする。undefinedならMonacoの既定のまま。 */
function readColor(style: CSSStyleDeclaration, name: string): string | undefined {
  const value = style.getPropertyValue(name).trim();
  if (/^#[0-9a-f]{6}$/i.test(value)) return value;
  if (/^#[0-9a-f]{3}$/i.test(value)) {
    return `#${[...value.slice(1)].map((digit) => digit + digit).join('')}`;
  }
  return undefined;
}

/** #rrggbbと0〜1の不透明度を、#rrggbbaaにする。 */
function withAlpha(color: string | undefined, alpha: number): string | undefined {
  return color && color + Math.round(alpha * 255).toString(16).padStart(2, '0');
}

/**
 * ページの今のトークンの値から`theme`用のMonacoのテーマを定義し、その名前を返す。テーマが
 * 変わったら、エディターをそのテーマに切り替える前にもう一度呼ぶ。
 */
export function defineMonacoTheme(editor: MonacoThemeRegistry, theme: Theme): string {
  const style = getComputedStyle(document.documentElement);
  const background = readColor(style, '--background');
  const text = readColor(style, '--text');
  const accent = readColor(style, '--accent');
  const entries: Array<[string, string | undefined]> = [
    ['editor.background', background],
    ['editor.foreground', text],
    ['editorGutter.background', background],
    ['editorLineNumber.foreground', readColor(style, '--muted')],
    ['editorLineNumber.activeForeground', text],
    ['editor.lineHighlightBackground', readColor(style, '--surface')],
    ['editorCursor.foreground', text],
    ['editor.selectionBackground', withAlpha(accent, 0.3)],
    ['editor.inactiveSelectionBackground', withAlpha(accent, 0.15)],
    ['editorIndentGuide.background1', readColor(style, '--border')],
    ['editorIndentGuide.activeBackground1', readColor(style, '--border-strong')],
    ['editorWhitespace.foreground', readColor(style, '--border-strong')],
    ['focusBorder', accent],
  ];
  const colors = Object.fromEntries(
    entries.filter((entry): entry is [string, string] => entry[1] !== undefined),
  );
  const name = MONACO_THEME_NAMES[theme];
  editor.defineTheme(name, { base: theme === 'dark' ? 'vs-dark' : 'vs', inherit: true, rules: [], colors });
  return name;
}

/** エディターのfontFamilyの設定に渡す、tokens.cssの等幅の書体（--mono）。 */
export function monacoFontFamily(): string {
  return getComputedStyle(document.documentElement).getPropertyValue('--mono').trim() || 'monospace';
}
