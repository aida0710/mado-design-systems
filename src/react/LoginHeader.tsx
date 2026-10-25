import type { ReactNode } from 'react';

/**
 * ログインのカードの上端。製品のロゴと、同じ行の右に表示言語のメニュー。ログインと、最初の
 * パスワード変更の画面で同じ行を使う。
 */
export function LoginHeader({ logo, languagePicker }: { logo: ReactNode; languagePicker: ReactNode }) {
  return (
    <header className="login-mark login-header">
      {logo}
      {languagePicker}
    </header>
  );
}
