import { useId, useRef, type MouseEvent, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { useModalDialog } from './useModalDialog.js';

export type DialogSize = 'default' | 'wide' | 'extra-wide';
/** 640px未満での形。'fullscreen'は画面いっぱい、'sheet'は下から出る（短い確認向け）。 */
export type DialogNarrowLayout = 'fullscreen' | 'sheet';

export interface DialogProps {
  title: ReactNode;
  /** タイトルの下の小さな行。ダイアログの対象のパスなど。 */
  subtitle?: ReactNode;
  /** 閉じるボタン、Escape、`closesOnBackdropClick`のときは外側のクリックで呼ばれる。 */
  onClose: () => void;
  /** 閉じるボタンの読み上げの名前。表示言語で渡す。 */
  closeLabel: string;
  /** ダイアログを開いたままにすべき間（処理中）はfalse。閉じるボタンも無効になる。 */
  dismissible?: boolean;
  /** 既定では無効。誤ったクリックで、利用者がフォームに入力した内容を捨てないように。 */
  closesOnBackdropClick?: boolean;
  /** 既定は560px、wideは740px、extra-wideは1040px。 */
  size?: DialogSize;
  narrowLayout?: DialogNarrowLayout;
  /** 下端のボタン。<footer>に入れる。 */
  footer?: ReactNode;
  className?: string;
  /** 本体。余白は呼び出し側が<div className="dialog-body">か<form>で付ける。 */
  children: ReactNode;
}

/**
 * .dialogのタイトルバー・本体・ボタンを持つモーダルの<dialog>。マウントされている間は開いているので、
 * 呼び出し側は開いている間だけ描く（`{open && <Dialog … />}`）。
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
    // どのレイアウトでも中身がpaddingの枠を端から端まで覆うとは限らないので、<dialog>要素に当たった
    // だけでなく、ダイアログの箱の外に当たったときだけ外側のクリックとみなす。
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
      // タッチ画面では、useModalDialogがダイアログ自身にフォーカスする。
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
        {/* type="button": これが無いと、フォームの中に描いたダイアログでは、このボタンがその
            フォームを送信してしまう。 */}
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
