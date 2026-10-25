/*
 * 例外を投げないlocalStorage。プライベートブラウズやサイトデータのブロックでは使えないので、
 * そのときアプリは利用者の選択を、ページを開いている間だけ保つ。
 */
export function readStorage(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeStorage(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* ページを閉じるまでは、選択がそのまま効く。 */
  }
}
