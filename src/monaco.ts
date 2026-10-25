/*
 * Monaco editor themes in the colors of tokens.css. Monaco cannot resolve CSS variables, so the
 * values are read from the root element with getComputedStyle. The app passes its Monaco module,
 * which keeps monaco-editor out of this package.
 */
import type { Theme } from './theme';

/** The part of `monaco.editor` the themes need. */
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

/** A token color (#rgb or #rrggbb) as #rrggbb, or undefined to keep Monaco's default. */
function readColor(style: CSSStyleDeclaration, name: string): string | undefined {
  const value = style.getPropertyValue(name).trim();
  if (/^#[0-9a-f]{6}$/i.test(value)) return value;
  if (/^#[0-9a-f]{3}$/i.test(value)) {
    return `#${[...value.slice(1)].map((digit) => digit + digit).join('')}`;
  }
  return undefined;
}

/** #rrggbb with an opacity from 0 to 1, as #rrggbbaa. */
function withAlpha(color: string | undefined, alpha: number): string | undefined {
  return color && color + Math.round(alpha * 255).toString(16).padStart(2, '0');
}

/**
 * Defines the Monaco theme for `theme` from the token values the page has now, and returns its
 * name. Call it again after the theme changes, before the editor switches to the theme.
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

/** The monospace family of tokens.css (--mono) for the editor's fontFamily option. */
export function monacoFontFamily(): string {
  return getComputedStyle(document.documentElement).getPropertyValue('--mono').trim() || 'monospace';
}
