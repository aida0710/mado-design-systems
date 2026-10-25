/*
 * メニューや候補の一覧で、矢印キー・Home・Endによる移動先を決める。
 */
export type ListNavigationKey = 'ArrowDown' | 'ArrowUp' | 'Home' | 'End';

const LIST_NAVIGATION_KEYS: ReadonlySet<string> = new Set<ListNavigationKey>(['ArrowDown', 'ArrowUp', 'Home', 'End']);

export function isListNavigationKey(key: string): key is ListNavigationKey {
  return LIST_NAVIGATION_KEYS.has(key);
}

/**
 * `key`を押した後に選ぶ項目の番号。`current`は今の項目（無ければ-1）、`count`は項目の数。
 * 矢印は端で反対側へ回り込む。項目が無ければ-1。
 */
export function moveActiveIndex({
  current,
  key,
  count,
}: {
  current: number;
  key: ListNavigationKey;
  count: number;
}): number {
  if (count === 0) return -1;
  switch (key) {
    case 'Home':
      return 0;
    case 'End':
      return count - 1;
    case 'ArrowDown':
      return current < 0 ? 0 : (current + 1) % count;
    case 'ArrowUp':
      return current < 0 ? count - 1 : (current - 1 + count) % count;
  }
}
