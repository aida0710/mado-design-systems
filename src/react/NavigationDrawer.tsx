import { useEffect, useId, useRef, useState, type MouseEvent, type ReactNode } from 'react';
import { Menu, X } from 'lucide-react';

export interface NavigationDrawerLabels {
  open: string;
  close: string;
  /** The accessible name of the drawer, such as "Main navigation". */
  navigation: string;
}

/**
 * The navigation below md: the menu button in the top bar opens a drawer from the left. The drawer
 * is a modal <dialog>, so Escape closes it and the focus goes back to the button. A click outside
 * the drawer or on a link closes it too.
 */
export function NavigationDrawer({
  labels,
  header,
  children,
}: {
  labels: NavigationDrawerLabels;
  /** The top row of the drawer, usually the product logo. */
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
    // The panel fills the dialog's box, so a click that hits the dialog itself is on the backdrop.
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
