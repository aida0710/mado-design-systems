import { describe, expect, it } from 'vitest';
import { formatBytes, formatRelativeTime } from '../src/format';
import { clampNavigationWidth, narrowerThan, NAVIGATION_WIDTH, storedNavigationWidth } from '../src/layout';
import { placeDropdown } from '../src/popover';

describe('layout', () => {
  it('切り替え幅は範囲の書き方のメディアクエリになる', () => {
    expect(narrowerThan('md')).toBe('(width < 900px)');
  });

  it('保存した幅は範囲に収め、読めない値なら既定の幅にする', () => {
    expect(storedNavigationWidth('9999')).toBe(NAVIGATION_WIDTH.max);
    expect(storedNavigationWidth('abc')).toBe(NAVIGATION_WIDTH.default);
    expect(storedNavigationWidth(null)).toBe(NAVIGATION_WIDTH.default);
    expect(clampNavigationWidth(200.4)).toBe(200);
  });
});

describe('placeDropdown', () => {
  const viewport = { width: 800, height: 600 };

  it('ボタンの下に置き、右端を越えるなら左へずらす', () => {
    const placement = placeDropdown({
      anchor: { top: 10, bottom: 40, left: 760, width: 30 },
      viewport,
      minWidth: 220,
      maxHeight: 300,
    });
    expect(placement).toMatchObject({ top: 44, left: 800 - 8 - 220, width: 220 });
  });

  it('下の余地が少なく上が広ければ上向きに開き、高さは負にならない', () => {
    const placement = placeDropdown({
      anchor: { top: 580, bottom: 598, left: 0, width: 30 },
      viewport,
      minWidth: 100,
      maxHeight: 300,
    });
    expect(placement.bottom).toBe(600 - 580 + 4);
    expect(placement.maxHeight).toBe(300);
    const tiny = placeDropdown({
      anchor: { top: 2, bottom: 4, left: 0, width: 30 },
      viewport: { width: 800, height: 6 },
      minWidth: 100,
      maxHeight: 300,
    });
    expect(tiny.maxHeight).toBe(0);
  });
});

describe('formatBytes', () => {
  it('1024で割った値を2進の単位で書く', () => {
    expect(formatBytes(512, 'en-US')).toBe('512 B');
    expect(formatBytes(1536, 'en-US')).toBe('1.5 KiB');
  });

  it('1024.0 KiB のような繰り上がりは次の単位にする', () => {
    expect(formatBytes(1024 * 1024 - 1, 'en-US')).toBe('1.0 MiB');
  });
});

describe('formatRelativeTime', () => {
  const now = Date.parse('2026-10-26T12:00:00Z');

  it('経過時間を表示言語の言い方で書く', () => {
    expect(formatRelativeTime('2026-10-26T11:55:00Z', { intlLocale: 'ja-JP', now })).toBe('5 分前');
    expect(formatRelativeTime('2026-10-25T12:00:00Z', { intlLocale: 'en-US', now })).toBe('yesterday');
  });

  it('少し進んだ時計の時刻は今として扱う', () => {
    expect(formatRelativeTime('2026-10-26T12:00:30Z', { intlLocale: 'en-US', now })).toBe('now');
  });
});
