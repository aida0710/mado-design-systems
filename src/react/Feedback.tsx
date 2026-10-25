import type { ReactNode } from 'react';
import { AlertCircle, LoaderCircle, RefreshCw } from 'lucide-react';

/** 読み込みや操作の失敗。`retry`を渡すと「再試行」のボタンを出す。文言は表示言語で渡す。 */
export function ErrorNotice({
  message,
  retry,
  retryLabel,
}: {
  message: string | null;
  retry?: () => void;
  retryLabel?: string;
}) {
  if (!message) return null;
  return (
    <div className="notice error" role="alert">
      <AlertCircle size={16} aria-hidden="true" />
      <span>{message}</span>
      {retry && retryLabel && (
        <button type="button" className="button small" onClick={retry}>
          <RefreshCw size={14} aria-hidden="true" />
          {retryLabel}
        </button>
      )}
    </div>
  );
}

/** 読み込み中の印。 */
export function LoadingMessage({ label }: { label: string }) {
  return (
    <div className="state-message" role="status">
      <LoaderCircle className="spin" size={18} aria-hidden="true" />
      {label}
    </div>
  );
}

/** 一覧などが空のときの一文。 */
export function EmptyMessage({ children }: { children: ReactNode }) {
  return <div className="state-message">{children}</div>;
}
