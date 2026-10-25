import { useEffect, type RefObject } from 'react';

// The fields a dialog opens on in place of its close button, so typing starts at once.
const FIELD_SELECTOR =
  'input:not([type="hidden"]):not(:disabled), select:not(:disabled), textarea:not(:disabled)';
// On a touch screen a focused field opens the on-screen keyboard over half the dialog before the
// user has read it; there the dialog itself takes the focus (Dialog gives it tabIndex -1).
const TOUCH_SCREEN_QUERY = '(pointer: coarse)';

/**
 * Shows the dialog as modal while its component is mounted, with the focus on its first field (on
 * the dialog itself on a touch screen), and afterwards gives the focus back to the element that had
 * it when the dialog opened, usually the button that opened it.
 *
 * Callers unmount an open dialog (`{open && <XxxDialog />}`). The browser returns focus only in
 * close(), and by the time this cleanup runs the dialog has left the document, so without this the
 * focus would fall back to the top of the page.
 */
export function useModalDialog(dialogRef: RefObject<HTMLDialogElement | null>): void {
  useEffect(() => {
    const dialog = dialogRef.current;
    const opener = document.activeElement;
    // jsdom has no showModal; tests still see the dialog because it is rendered open.
    if (dialog && typeof dialog.showModal === 'function' && !dialog.open) dialog.showModal();
    if (dialog) focusOnOpen(dialog);
    return () => {
      if (dialog?.open && typeof dialog.close === 'function') dialog.close();
      returnFocusTo(opener);
    };
  }, [dialogRef]);
}

function focusOnOpen(dialog: HTMLDialogElement): void {
  if (typeof window.matchMedia === 'function' && window.matchMedia(TOUCH_SCREEN_QUERY).matches) {
    dialog.focus();
    return;
  }
  // A field in a closed <details> or hidden by its form cannot take the focus; the next one does.
  for (const field of dialog.querySelectorAll<HTMLElement>(FIELD_SELECTOR)) {
    field.focus();
    if (document.activeElement === field) return;
  }
  if (!dialog.contains(document.activeElement)) dialog.focus();
}

/**
 * Focuses the opener only when the focus was lost with the dialog: code that focused something on
 * purpose after closing (a new page, a field) keeps it, and an opener that left the page (an item
 * of a closed menu, a deleted row) is skipped.
 */
function returnFocusTo(opener: Element | null): void {
  const lostFocus = document.activeElement === null || document.activeElement === document.body;
  if (lostFocus && opener instanceof HTMLElement && opener !== document.body && opener.isConnected) {
    opener.focus();
  }
}
