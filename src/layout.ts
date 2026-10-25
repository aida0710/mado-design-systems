/*
 * The screen widths both apps switch their layout at, and the width of the navigation sidebar.
 * The stylesheets write the same widths as range media queries (`@media (width < 900px)`).
 */
export const BREAKPOINT_PX = {
  sm: 640,
  md: 900,
  lg: 1200,
} as const;

export type Breakpoint = keyof typeof BREAKPOINT_PX;

/** A media query that matches while the screen is narrower than `breakpoint`. */
export function narrowerThan(breakpoint: Breakpoint): string {
  return `(width < ${BREAKPOINT_PX[breakpoint]}px)`;
}

/** The sidebar width in px. Dragging its edge and the arrow keys move it between min and max. */
export const NAVIGATION_WIDTH = { default: 192, min: 160, max: 360, keyboardStep: 16 } as const;

export function clampNavigationWidth(width: number): number {
  return Math.round(Math.min(NAVIGATION_WIDTH.max, Math.max(NAVIGATION_WIDTH.min, width)));
}

/** The width kept in storage, or the default width when the stored value is not a number. */
export function storedNavigationWidth(raw: string | null): number {
  const width = raw === null ? Number.NaN : Number(raw);
  return Number.isFinite(width) ? clampNavigationWidth(width) : NAVIGATION_WIDTH.default;
}
