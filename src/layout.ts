/*
 * 両アプリがレイアウトを切り替える画面幅と、ナビゲーションのサイドバーの幅。
 * スタイルシートには、同じ幅を範囲のメディアクエリ（`@media (width < 900px)`）で書く。
 */
export const BREAKPOINT_PX = {
  sm: 640,
  md: 900,
  lg: 1200,
} as const;

export type Breakpoint = keyof typeof BREAKPOINT_PX;

/** 画面が`breakpoint`より狭い間だけ当てはまるメディアクエリ。 */
export function narrowerThan(breakpoint: Breakpoint): string {
  return `(width < ${BREAKPOINT_PX[breakpoint]}px)`;
}

/** サイドバーの幅（px）。端のドラッグと矢印キーで、minからmaxの間で変わる。 */
export const NAVIGATION_WIDTH = { default: 192, min: 160, max: 360, keyboardStep: 16 } as const;

export function clampNavigationWidth(width: number): number {
  return Math.round(Math.min(NAVIGATION_WIDTH.max, Math.max(NAVIGATION_WIDTH.min, width)));
}

/** 保存してある幅。保存した値が数値でなければ既定の幅。 */
export function storedNavigationWidth(raw: string | null): number {
  const width = raw === null ? Number.NaN : Number(raw);
  return Number.isFinite(width) ? clampNavigationWidth(width) : NAVIGATION_WIDTH.default;
}
