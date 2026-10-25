/*
 * テキストをコピーする。HTTPSだけでなく、LANの中の素のHTTPで動かす環境でも使える。そこでは
 * Clipboard APIが使えないが、選択したtextareaとexecCommand('copy')ならまだ動く。
 */

/** ブラウザが両方のコピーの方法を拒んだときは、falseで解決する。 */
export async function copyText(value: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return true;
    }
  } catch {
    // ブラウザの権限でClipboard APIが拒まれても、利用者の操作によるコピーなら動くことがある。
  }
  return copySelectedText(value);
}

function copySelectedText(value: string): boolean {
  if (typeof document === 'undefined' || typeof document.execCommand !== 'function') return false;
  const focusedElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  const focusedInput =
    focusedElement instanceof HTMLInputElement || focusedElement instanceof HTMLTextAreaElement
      ? focusedElement
      : null;
  const inputSelection = focusedInput
    ? {
        start: focusedInput.selectionStart,
        end: focusedInput.selectionEnd,
        direction: focusedInput.selectionDirection,
      }
    : null;
  const selection = window.getSelection();
  const ranges = selection
    ? Array.from({ length: selection.rangeCount }, (_, index) => selection.getRangeAt(index).cloneRange())
    : [];
  const textarea = document.createElement('textarea');
  textarea.value = value;
  textarea.readOnly = true;
  textarea.tabIndex = -1;
  textarea.setAttribute('aria-hidden', 'true');
  textarea.style.cssText = 'position:fixed;top:0;left:0;opacity:0;pointer-events:none';
  // モーダルダイアログの外の要素は操作できない（inert）ので、コピー用の要素はダイアログの中に置く。
  const container =
    focusedElement?.closest('dialog[open]') ?? document.querySelector('dialog[open]') ?? document.body;
  container.append(textarea);
  try {
    textarea.focus({ preventScroll: true });
    textarea.select();
    return document.execCommand('copy');
  } catch {
    return false;
  } finally {
    textarea.remove();
    focusedElement?.focus({ preventScroll: true });
    if (focusedInput && inputSelection && inputSelection.start !== null && inputSelection.end !== null) {
      focusedInput.setSelectionRange(
        inputSelection.start,
        inputSelection.end,
        inputSelection.direction ?? undefined,
      );
    }
    if (selection) {
      selection.removeAllRanges();
      ranges.forEach((range) => selection.addRange(range));
    }
  }
}
