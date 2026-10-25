import { useEffect, type RefObject } from 'react';

// ダイアログを開いたとき、閉じるボタンの代わりにフォーカスする入力欄。すぐに入力を始められるように。
const FIELD_SELECTOR =
  'input:not([type="hidden"]):not(:disabled), select:not(:disabled), textarea:not(:disabled)';
// タッチ画面では、入力欄にフォーカスすると、利用者が読む前に画面のキーボードがダイアログの半分を
// 覆ってしまう。そこではダイアログ自身がフォーカスを持つ（DialogがtabIndex -1を付ける）。
const TOUCH_SCREEN_QUERY = '(pointer: coarse)';

/**
 * 部品がマウントされている間、ダイアログをモーダルで表示し、最初の入力欄（タッチ画面ではダイアログ
 * 自身）にフォーカスする。閉じた後は、開いたときにフォーカスを持っていた要素（たいていは開いた
 * ボタン）へフォーカスを戻す。
 *
 * 呼び出し側は、開いているダイアログをアンマウントする（`{open && <XxxDialog />}`）。ブラウザが
 * フォーカスを戻すのはclose()のときだけで、この後片付けが動く時点ではダイアログはもう文書から
 * 外れている。これが無ければ、フォーカスはページの先頭に戻ってしまう。
 */
export function useModalDialog(dialogRef: RefObject<HTMLDialogElement | null>): void {
  useEffect(() => {
    const dialog = dialogRef.current;
    const opener = document.activeElement;
    // jsdomにはshowModalが無い。openの状態で描くので、テストでもダイアログは見える。
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
  // 閉じた<details>の中や、フォームが隠している入力欄にはフォーカスできないので、次の入力欄にする。
  for (const field of dialog.querySelectorAll<HTMLElement>(FIELD_SELECTOR)) {
    field.focus();
    if (document.activeElement === field) return;
  }
  if (!dialog.contains(document.activeElement)) dialog.focus();
}

/**
 * ダイアログと一緒にフォーカスが失われたときだけ、開いた要素にフォーカスする。閉じた後に意図して
 * ほかへフォーカスしたコード（新しいページ、入力欄）はそのままにし、ページから消えた開いた要素
 * （閉じたメニューの項目、削除した行）は飛ばす。
 */
function returnFocusTo(opener: Element | null): void {
  const lostFocus = document.activeElement === null || document.activeElement === document.body;
  if (lostFocus && opener instanceof HTMLElement && opener !== document.body && opener.isConnected) {
    opener.focus();
  }
}
