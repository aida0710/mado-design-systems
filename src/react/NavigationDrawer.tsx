import { useEffect, useId, useRef, useState, type MouseEvent, type ReactNode } from 'react';
import { Menu, X } from 'lucide-react';

export interface NavigationDrawerLabels {
  open: string;
  close: string;
  /** ドロワーの読み上げの名前（"Main navigation"など）。 */
  navigation: string;
}

/**
 * md未満のナビゲーション。上部バーのメニューボタンで、左からドロワーを開く。ドロワーはモーダルの
 * <dialog>なので、Escapeで閉じ、フォーカスはボタンへ戻る。ドロワーの外やリンクのクリックでも
 * 閉じる。
 */
export function NavigationDrawer({
  labels,
  header,
  children,
}: {
  labels: NavigationDrawerLabels;
  /** ドロワーの一番上の行。たいていは製品のロゴ。 */
  header: ReactNode;
  children: ReactNode;
}) {
  const drawerId = useId();
  const drawerRef = useRef<HTMLDialogElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => {
    const drawer = drawerRef.current;
    if (!drawer) return;
    if (isOpen && !drawer.open) drawer.showModal();
    if (!isOpen && drawer.open) drawer.close();
  }, [isOpen]);
  const closeOnBackdropOrLink = (event: MouseEvent<HTMLDialogElement>) => {
    // パネルがダイアログの箱を埋めるので、ダイアログ自身に当たったクリックは背景へのクリック。
    const isBackdrop = event.target === event.currentTarget;
    if (isBackdrop || (event.target as Element).closest('a')) setIsOpen(false);
  };
  return (
    <>
      <button
        type="button"
        className="icon-button navigation-toggle"
        aria-label={isOpen ? labels.close : labels.open}
        aria-expanded={isOpen}
        aria-controls={drawerId}
        onClick={() => setIsOpen((current) => !current)}
      >
        <Menu size={20} />
      </button>
      <dialog
        ref={drawerRef}
        id={drawerId}
        className="navigation-drawer"
        aria-label={labels.navigation}
        onCancel={(event) => {
          event.preventDefault();
          setIsOpen(false);
        }}
        onClose={() => setIsOpen(false)}
        onClick={closeOnBackdropOrLink}
      >
        <div className="navigation-drawer-panel">
          <div className="navigation-drawer-header">
            {header}
            <button type="button" className="icon-button" aria-label={labels.close} onClick={() => setIsOpen(false)}>
              <X size={20} />
            </button>
          </div>
          {children}
        </div>
      </dialog>
    </>
  );
}
