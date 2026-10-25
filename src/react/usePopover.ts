import { useEffect, useRef, useState } from 'react';

/**
 * `container`の中に開くポップオーバーの開閉。外側のクリック、Escape、`closeKey`の変化（画面の
 * 移動ならpathnameを渡す）で閉じる。中にフォーカスがある間にEscapeで閉じたときは、開くボタン
 * （containerの中のaria-expandedを持つ要素）へフォーカスを戻す。中身と一緒にフォーカスが
 * 消えないように。
 */
export function usePopover<Container extends HTMLElement = HTMLDivElement>({ closeKey }: { closeKey?: unknown } = {}) {
  const container = useRef<Container>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => setIsOpen(false), [closeKey]);
  useEffect(() => {
    if (!isOpen) return;
    const closeOutside = (event: PointerEvent) => {
      if (!container.current?.contains(event.target as Node)) setIsOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      const element = container.current;
      if (element?.contains(document.activeElement)) element.querySelector<HTMLElement>('[aria-expanded]')?.focus();
      setIsOpen(false);
    };
    document.addEventListener('pointerdown', closeOutside);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOutside);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [isOpen]);

  return {
    container,
    isOpen,
    toggle: () => setIsOpen((open) => !open),
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
  };
}
