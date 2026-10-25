import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// 書き出したdist/を、アプリのVitestやNodeと同じくNodeのESMで読めるか。相対importに
// 拡張子が無いと、バンドラーでは読めてもNodeでは読めない（0.6.0の不具合）。
const root = new URL('../', import.meta.url);
const packageJson = JSON.parse(readFileSync(new URL('package.json', root), 'utf8'));
const moduleExports = Object.entries(packageJson.exports)
  .filter(([, target]) => typeof target === 'object' && target.default.startsWith('./dist/'))
  .map(([path]) => path);

describe('dist', () => {
  it.each(moduleExports)('%s を Node の ESM で読める', (path) => {
    const specifier = `@mado/design-system${path.slice(1)}`;
    const output = execFileSync(
      process.execPath,
      ['--input-type=module', '-e', `const m = await import('${specifier}'); console.log(Object.keys(m).length);`],
      { cwd: root, encoding: 'utf8' },
    );
    expect(Number(output.trim())).toBeGreaterThan(0);
  });
});
