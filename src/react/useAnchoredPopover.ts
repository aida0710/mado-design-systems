import { useLayoutEffect, useState, type CSSProperties, type RefObject } from 'react';
import { placeDropdown, type DropdownAlignment } from '../popover.js';

// popover属性を持つ要素はトップレイヤーに出るので、サイドバーのoverflowや重なり順で隠れない。
// popover属性の無い要素と、Popover APIの無いブラウザでは、position: fixedだけになる。
function showsInTopLayer(element: HTMLElement): boolean {
  return element.hasAttribute('popover') && typeof element.showPopover === 'function';
}

/**
 * 開いている間、`popoverRef`の要素を`anchorRef`の要素の下（空きが無ければ上）かつ画面の中に置き、
 * リサイズとスクロールのたびに置き直す。適用するstyleを返す。
 * `maxWidth`を渡すと、幅を`minWidth`から`maxWidth`の間で中身に合わせる。
 */
export function useAnchoredPopover({
  isOpen,
  anchorRef,
  popoverRef,
  minWidth,
  maxWidth,
  maxHeight,
  alignment = 'start',
}: {
  isOpen: boolean;
  anchorRef: RefObject<HTMLElement | null>;
  popoverRef: RefObject<HTMLElement | null>;
  minWidth: number;
  maxWidth?: number;
  maxHeight: number;
  alignment?: DropdownAlignment;
}): CSSProperties | undefined {
  const [style, setStyle] = useState<CSSProperties>();
  useLayoutEffect(() => {
    const anchor = anchorRef.current;
    const popover = popoverRef.current;
    if (!isOpen || !anchor || !popover) return;
    if (showsInTopLayer(popover) && !popover.matches(':popover-open')) popover.showPopover();
    const place = () => {
      const rect = anchor.getBoundingClientRect();
      setStyle(
        placeDropdown({
          anchor: { top: rect.top, bottom: rect.bottom, left: rect.left, width: rect.width },
          viewport: { width: window.innerWidth, height: window.innerHeight },
          minWidth,
          maxWidth,
          contentWidth: maxWidth === undefined ? undefined : popover.scrollWidth,
          maxHeight,
          alignment,
        }),
      );
    };
    place();
    window.addEventListener('resize', place);
    // キャプチャ段階で受けて、サイドバーや表の中のスクロールも拾う。それらのスクロールでもボタンは動くため。
    window.addEventListener('scroll', place, true);
    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
      if (showsInTopLayer(popover) && popover.matches(':popover-open')) popover.hidePopover();
      // 次に開くときは、位置を決める前の大きさ（中身の幅）から測り直す。
      setStyle(undefined);
    };
  }, [isOpen, anchorRef, popoverRef, minWidth, maxWidth, maxHeight, alignment]);
  return isOpen ? style : undefined;
}
