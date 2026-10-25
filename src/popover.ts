/*
 * ボタンの下に開くメニュー（position: fixed）を、画面からはみ出さない位置に置く。
 */

/** メニューと画面の端の間に必ず空ける間隔。 */
export const DROPDOWN_VIEWPORT_MARGIN = 8;
// メニューと、それを開いたボタンの間隔。
const DROPDOWN_ANCHOR_GAP = 4;
// ボタンの下の空きがこれより狭く、上の方が広いときは、メニューを上に開く。
const DROPDOWN_MIN_HEIGHT_BELOW = 200;

export type DropdownAlignment = 'start' | 'end';

export interface DropdownAnchor {
  top: number;
  bottom: number;
  left: number;
  width: number;
}

/** position: fixedのメニューの位置。topとbottomのどちらか一方だけが入る。 */
export interface DropdownPlacement {
  left: number;
  width: number;
  maxHeight: number;
  top?: number;
  bottom?: number;
}

/**
 * メニューを`anchor`（ボタン。画面の座標）の下に置き、画面からはみ出さないようにする。
 * 幅はボタンと`minWidth`の広い方。`contentWidth`（中身の幅）を渡すと、`maxWidth`まで中身に
 * 合わせて広げる。狭い画面では画面の幅まで縮め、右端からはみ出すなら左へずらし、下の空きが
 * 少なければ上に開く。
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
