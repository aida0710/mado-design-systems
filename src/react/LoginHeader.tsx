import type { ReactNode } from 'react';

/**
 * The top of the sign-in card: the product logo, with the language menu on the same row at the
 * right. The sign-in and first password change screens use the same row.
 */
export function LoginHeader({ logo, languagePicker }: { logo: ReactNode; languagePicker: ReactNode }) {
  return (
    <header className="login-mark login-header">
      {logo}
      {languagePicker}
    </header>
  );
}
