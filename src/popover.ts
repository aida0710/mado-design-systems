/*
 * Where a menu under a button (position: fixed) goes so that it stays on the screen.
 */

/** The space always kept between a menu and the edge of the screen. */
export const DROPDOWN_VIEWPORT_MARGIN = 8;
// The gap between the menu and the button that opened it.
const DROPDOWN_ANCHOR_GAP = 4;
// With less room than this below the button and more above, the menu opens upward.
const DROPDOWN_MIN_HEIGHT_BELOW = 200;

export type DropdownAlignment = 'start' | 'end';

export interface DropdownAnchor {
  top: number;
  bottom: number;
  left: number;
  width: number;
}

/** The place of a position: fixed menu. Exactly one of top and bottom is set. */
export interface DropdownPlacement {
  left: number;
  width: number;
  maxHeight: number;
  top?: number;
  bottom?: number;
}

/**
 * Puts the menu under `anchor` (the button, in screen coordinates) and keeps it on the screen.
 * The width is the wider of the button and `minWidth`; with `contentWidth` (the width of the
 * content) it grows to fit the content up to `maxWidth`. On a narrow screen the menu shrinks to the
 * screen, past the right edge it moves left, and with little room below it opens upward.
 */
export function placeDropdown({
  anchor,
  viewport,
  minWidth,
  maxWidth = Number.POSITIVE_INFINITY,
  contentWidth,
  maxHeight,
  alignment = 'start',
}: {
  anchor: DropdownAnchor;
  viewport: { width: number; height: number };
  minWidth: number;
  maxWidth?: number;
  contentWidth?: number;
  maxHeight: number;
  alignment?: DropdownAlignment;
}): DropdownPlacement {
  const widestFit = Math.max(0, viewport.width - 2 * DROPDOWN_VIEWPORT_MARGIN);
  const preferredWidth =
    contentWidth === undefined ? minWidth : Math.min(Math.max(contentWidth, minWidth), maxWidth);
  const width = Math.min(Math.max(anchor.width, preferredWidth), widestFit);
  const rightmostLeft = viewport.width - DROPDOWN_VIEWPORT_MARGIN - width;
  const alignedLeft = alignment === 'end' ? anchor.left + anchor.width - width : anchor.left;
  const left = Math.max(DROPDOWN_VIEWPORT_MARGIN, Math.min(alignedLeft, rightmostLeft));
  const roomBelow = viewport.height - anchor.bottom - DROPDOWN_ANCHOR_GAP - DROPDOWN_VIEWPORT_MARGIN;
  const roomAbove = anchor.top - DROPDOWN_ANCHOR_GAP - DROPDOWN_VIEWPORT_MARGIN;
  const opensUpward = roomBelow < DROPDOWN_MIN_HEIGHT_BELOW && roomAbove > roomBelow;
  if (opensUpward) {
    return {
      left,
      width,
      maxHeight: Math.max(0, Math.min(maxHeight, roomAbove)),
      bottom: viewport.height - anchor.top + DROPDOWN_ANCHOR_GAP,
    };
  }
  return {
    left,
    width,
    maxHeight: Math.max(0, Math.min(maxHeight, roomBelow)),
    top: anchor.bottom + DROPDOWN_ANCHOR_GAP,
  };
}
