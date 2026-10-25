import { useId, useRef, type MouseEvent, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { useModalDialog } from './useModalDialog';

export type DialogSize = 'default' | 'wide' | 'extra-wide';
/** Below 640px: 'fullscreen' fills the screen, 'sheet' rises from the bottom (short confirmations). */
export type DialogNarrowLayout = 'fullscreen' | 'sheet';

export interface DialogProps {
  title: ReactNode;
  /** A small line under the title, such as the path the dialog is about. */
  subtitle?: ReactNode;
  /** Called by the close button, Escape and, with `closesOnBackdropClick`, a click outside. */
  onClose: () => void;
  /** The accessible name of the close button, in the display language. */
  closeLabel: string;
  /** False while the dialog must stay open (work in progress); the close button is disabled too. */
  dismissible?: boolean;
  /** Off by default, so a stray click does not throw away what the user typed into a form. */
  closesOnBackdropClick?: boolean;
  /** 560px by default, wide 740px, extra-wide 1040px. */
  size?: DialogSize;
  narrowLayout?: DialogNarrowLayout;
  /** The buttons at the bottom, put in a <footer>. */
  footer?: ReactNode;
  className?: string;
  /** The body. Callers pad it with <div className="dialog-body"> or a <form>. */
  children: ReactNode;
}

/**
 * A modal <dialog> with the title bar, body and buttons of .dialog. It opens while mounted, so
 * callers render it only while it is open (`{open && <Dialog … />}`).
 */
export function Dialog({
  title,
  subtitle,
  onClose,
  closeLabel,
  dismissible = true,
  closesOnBackdropClick = false,
  size = 'default',
  narrowLayout = 'fullscreen',
  footer,
  className,
  children,
}: DialogProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  useModalDialog(dialogRef);
  const classes = [
    'dialog',
    size !== 'default' && size,
    narrowLayout === 'sheet' ? 'sheet-on-narrow' : 'fullscreen-on-narrow',
    className,
  ].filter(Boolean);
  const closeOnBackdrop = (event: MouseEvent<HTMLDialogElement>) => {
    // The content does not cover the padding box edge to edge in every layout, so a click counts as
    // outside only when it lands outside the dialog's box, not merely on the <dialog> element.
    if (!closesOnBackdropClick || !dismissible || event.target !== event.currentTarget) return;
    const box = event.currentTarget.getBoundingClientRect();
    const isOutside =
      event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom;
    if (isOutside) onClose();
  };
  return (
    <dialog
      ref={dialogRef}
      className={classes.join(' ')}
      aria-labelledby={titleId}
      // useModalDialog focuses the dialog itself on a touch screen.
      tabIndex={-1}
      onCancel={(event) => {
        event.preventDefault();
        if (dismissible) onClose();
      }}
      onClick={closeOnBackdrop}
    >
      <header>
        <div className="dialog-heading">
          <h2 id={titleId}>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
        {/* type="button": a dialog rendered inside a form would otherwise submit that form. */}
        <button
          type="button"
          className="icon-button"
          aria-label={closeLabel}
          title={closeLabel}
          onClick={onClose}
          disabled={!dismissible}
        >
          <X size={18} aria-hidden="true" />
        </button>
      </header>
      {children}
      {footer && <footer>{footer}</footer>}
    </dialog>
  );
}
