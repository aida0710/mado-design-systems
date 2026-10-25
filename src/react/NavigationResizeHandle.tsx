import { useRef, useState } from 'react';
import { NAVIGATION_WIDTH } from '../layout';

/**
 * The right edge of the full sidebar. Drag it, or focus it and use ←/→ (Home/End for the smallest
 * and largest width) to change the width; a double click or Enter goes back to the default width.
 */
export function NavigationResizeHandle({
  width,
  onResize,
  onReset,
  label,
}: {
  width: number;
  onResize: (width: number) => void;
  onReset: () => void;
  /** The accessible name, such as "Sidebar width", in the display language. */
  label: string;
}) {
  const dragStart = useRef<{ pointerX: number; width: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const endDrag = () => {
    dragStart.current = null;
    setIsDragging(false);
  };
  return (
    <div
      className="navigation-resize-handle"
      role="separator"
      aria-orientation="vertical"
      aria-label={label}
      aria-valuemin={NAVIGATION_WIDTH.min}
      aria-valuemax={NAVIGATION_WIDTH.max}
      aria-valuenow={width}
      tabIndex={0}
      data-dragging={isDragging ? 'true' : undefined}
      onPointerDown={(event) => {
        if (event.button !== 0) return;
        event.preventDefault();
        event.currentTarget.setPointerCapture(event.pointerId);
        dragStart.current = { pointerX: event.clientX, width };
        setIsDragging(true);
      }}
      onPointerMove={(event) => {
        const start = dragStart.current;
        if (start) onResize(start.width + event.clientX - start.pointerX);
      }}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onDoubleClick={onReset}
      onKeyDown={(event) => {
        const step = NAVIGATION_WIDTH.keyboardStep;
        if (event.key === 'ArrowLeft') onResize(width - step);
        else if (event.key === 'ArrowRight') onResize(width + step);
        else if (event.key === 'Home') onResize(NAVIGATION_WIDTH.min);
        else if (event.key === 'End') onResize(NAVIGATION_WIDTH.max);
        else if (event.key === 'Enter') onReset();
        else return;
        event.preventDefault();
      }}
    />
  );
}
