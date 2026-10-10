import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// The rules of README.md for the stylesheets: colors only as tokens, every variable defined here,
// the dark theme overriding light values only, and the three widths both apps switch at.
const root = new URL('../', import.meta.url);
const read = (name) => readFileSync(new URL(name, root), 'utf8');
const withoutComments = (css) => css.replace(/\/\*[\s\S]*?\*\//g, '');
const stylesheetNames = ['tokens.css', 'fonts.css', 'base.css', 'components.css', 'shell.css', 'code.css'];
const stylesheets = stylesheetNames.map((name) => ({ name, css: withoutComments(read(name)) }));
const packageJson = JSON.parse(read('package.json'));

const LITERAL_COLOR =
  /#[0-9a-f]{3,8}\b|\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch)\(|(?<![\w-])(?:white|black)(?![\w-])/i;
const declarations = (css) =>
  [...css.matchAll(/((?:--)?[a-z][\w-]*)\s*:\s*([^;{}]+);/gi)].map((match) => ({
    property: match[1],
    value: match[2].trim(),
  }));
const definedProperties = (css) =>
  declarations(css)
    .map(({ property }) => property)
    .filter((property) => property.startsWith('--'));
const ruleBody = (css, selector) => {
  const start = css.indexOf(`${selector} {`);
  return start < 0 ? '' : css.slice(start, css.indexOf('\n}', start));
};

describe('stylesheets', () => {
  it('色の値は tokens.css の変数の定義にだけ書き、ほかは変数を使う', () => {
    const offending = stylesheets.flatMap(({ name, css }) =>
      declarations(css)
        .filter(({ property, value }) => LITERAL_COLOR.test(value) && !(name === 'tokens.css' && property.startsWith('--')))
        .map(({ property, value }) => `${name}: ${property}: ${value}`),
    );
    expect(offending).toEqual([]);
  });

  it('参照する変数はどれもこのパッケージで定義している', () => {
    const defined = new Set(stylesheets.flatMap(({ css }) => definedProperties(css)));
    const undefinedReferences = stylesheets.flatMap(({ name, css }) =>
      [...css.matchAll(/var\((--[\w-]+)/g)]
        .map((match) => match[1])
        .filter((property) => !defined.has(property))
        .map((property) => `${name}: ${property}`),
    );
    expect(undefinedReferences).toEqual([]);
  });

  it('ダークテーマはライトで決めた変数だけを上書きする', () => {
    const tokens = stylesheets.find(({ name }) => name === 'tokens.css').css;
    const light = new Set(definedProperties(ruleBody(tokens, ':root')));
    const dark = definedProperties(ruleBody(tokens, ":root[data-theme='dark']"));
    expect(dark.length).toBeGreaterThan(0);
    expect(dark.filter((property) => !light.has(property))).toEqual([]);
  });

  it('メディアクエリは 640・900・1200px の範囲の書き方と prefers-reduced-motion だけ', () => {
    const allowed = new Set([
      '(width < 640px)',
      '(width < 900px)',
      '(width < 1200px)',
      '(prefers-reduced-motion: reduce)',
    ]);
    const queries = stylesheets.flatMap(({ name, css }) =>
      [...css.matchAll(/@media\s+([^{]+)\{/g)].map((match) => ({ name, query: match[1].trim() })),
    );
    expect(queries.length).toBeGreaterThan(0);
    expect(queries.filter(({ query }) => !allowed.has(query))).toEqual([]);
  });
});

describe('package', () => {
  it('exports と files に書いたファイルはどれもある', () => {
    const targets = Object.values(packageJson.exports).flatMap((target) =>
      typeof target === 'string' ? [target] : Object.values(target),
    );
    const missing = [...targets, ...packageJson.files.map((file) => `./${file}`)].filter(
      (path) => !existsSync(new URL(path, root)),
    );
    expect(missing).toEqual([]);
  });

  it('スタイルシートはどれも exports と files に入っている', () => {
    for (const name of stylesheetNames) {
      expect(packageJson.exports[`./${name}`]).toBe(`./${name}`);
      expect(packageJson.files).toContain(name);
    }
  });
});
