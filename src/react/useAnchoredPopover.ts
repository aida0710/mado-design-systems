import { useLayoutEffect, useState, type CSSProperties, type RefObject } from 'react';
import { placeDropdown, type DropdownAlignment } from '../popover';

// An element with the popover attribute goes to the top layer, so no overflow or stacking order of
// a sidebar hides it. Elements without it, and browsers without the Popover API, only get
// position: fixed.
function showsInTopLayer(element: HTMLElement): boolean {
  return element.hasAttribute('popover') && typeof element.showPopover === 'function';
}

/**
 * While open, keeps the `popoverRef` element under the `anchorRef` element (above it when there is
 * no room) and on the screen, placing it again on resize and scroll. Returns the style to apply.
 * With `maxWidth`, the width fits the content between `minWidth` and `maxWidth`.
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
    // Capturing also catches scrolling inside a sidebar or a table, which moves the button too.
    window.addEventListener('scroll', place, true);
    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
      if (showsInTopLayer(popover) && popover.matches(':popover-open')) popover.hidePopover();
      // The next opening measures again from the unplaced size (the width of the content).
      setStyle(undefined);
    };
  }, [isOpen, anchorRef, popoverRef, minWidth, maxWidth, maxHeight, alignment]);
  return isOpen ? style : undefined;
}
