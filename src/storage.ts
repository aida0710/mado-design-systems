/*
 * localStorage that never throws. Private browsing and blocked site data make it unavailable;
 * the apps then keep the user's choices only while the page is open.
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
    /* The choice still applies until the page is closed. */
  }
}
