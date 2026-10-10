import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// The contrast rules of tokens.css (WCAG AA): text 4.5:1 on every surface it sits on, focus marks
// and field borders 3:1. Each pair is checked in both themes.
const tokens = readFileSync(new URL('../tokens.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
const block = (selector) => {
  const start = tokens.indexOf(`${selector} {`);
  const body = tokens.slice(start, tokens.indexOf('\n}', start));
  return Object.fromEntries([...body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)].map((match) => [match[1], match[2].trim()]));
};
const light = block(':root');
const themes = { light, dark: { ...light, ...block(":root[data-theme='dark']") } };

const channels = (hex) => {
  const value = hex.slice(1);
  const full = value.length === 3 ? [...value].map((digit) => digit + digit).join('') : value;
  return [0, 2, 4].map((index) => parseInt(full.slice(index, index + 2), 16) / 255);
};
const luminance = (hex) => {
  const [red, green, blue] = channels(hex).map((channel) =>
    channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
  );
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
};
const contrast = (first, second) => {
  const [lighter, darker] = [luminance(first), luminance(second)].sort((a, b) => b - a);
  return (lighter + 0.05) / (darker + 0.05);
};

const SURFACES = ['--background', '--surface', '--surface-hover', '--table-header', '--selected'];
const pairs = [
  ...['--text', '--muted', '--link'].flatMap((text) => SURFACES.map((surface) => [text, surface, 4.5])),
  ['--text', '--accent-tint', 4.5],
  ['--link', '--accent-tint', 4.5],
  ['--error', '--background', 4.5],
  ['--error', '--error-tint', 4.5],
  ['--success', '--background', 4.5],
  ['--success', '--success-tint', 4.5],
  ['--on-accent', '--accent-strong', 4.5],
  ['--on-error-fill', '--error-fill', 4.5],
  ...['success', 'info', 'danger', 'neutral', 'attention', 'stopped'].map((kind) => [
    `--status-${kind}-text`,
    `--status-${kind}-background`,
    4.5,
  ]),
  ...['--header-text', '--header-text-muted', '--header-text-strong', '--header-alert'].flatMap((text) =>
    ['--header', '--header-hover', '--header-active'].map((surface) => [text, surface, 4.5]),
  ),
  ...[
    '--code-text',
    '--code-muted',
    '--code-error',
    '--code-warning',
    '--code-property',
    '--code-string',
    '--code-number',
    '--code-literal',
    '--code-keyword',
    '--code-function',
    '--code-type',
    '--code-heading',
    '--code-meta',
  ].map((text) => [text, '--code-background', 4.5]),
  ...['--accent', '--input-border'].flatMap((mark) => ['--background', '--surface'].map((surface) => [mark, surface, 3])),
  ...['--header', '--header-hover', '--header-active'].map((surface) => ['--header-indicator', surface, 3]),
];

describe('contrast', () => {
  for (const [theme, values] of Object.entries(themes)) {
    it(`${theme}: 文字は面に対して 4.5:1、フォーカスの印と入力欄の枠は 3:1 以上`, () => {
      const failing = pairs
        .map(([foreground, background, minimum]) => ({
          pair: `${foreground} on ${background}`,
          ratio: contrast(values[foreground], values[background]),
          minimum,
        }))
        .filter(({ ratio, minimum }) => ratio < minimum)
        .map(({ pair, ratio, minimum }) => `${pair}: ${ratio.toFixed(2)} < ${minimum}`);
      expect(failing).toEqual([]);
    });
  }

  it('比べる色はどれも #rrggbb で決めてある', () => {
    const names = new Set(pairs.flatMap(([foreground, background]) => [foreground, background]));
    for (const values of Object.values(themes)) {
      for (const name of names) expect(values[name]).toMatch(/^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i);
    }
  });
});
