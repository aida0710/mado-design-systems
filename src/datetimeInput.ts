/*
 * <input type="datetime-local">の値。ブラウザの地域の時刻で、タイムゾーンの記号は付かない。
 */

/** 日時をdatetime-localの値（例: 2026-10-26T09:30）にする。 */
export function formatLocalDateTimeInput(date: Date): string {
  const year = String(date.getFullYear()).padStart(4, '0');
  const [month, day, hours, minutes] = [date.getMonth() + 1, date.getDate(), date.getHours(), date.getMinutes()].map(
    (part) => String(part).padStart(2, '0'),
  );
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/** datetime-localの値を日時にする。あり得ない日付と、夏時間の切り替えで飛ぶ時刻はundefined。 */
export function parseLocalDateTimeInput(value: string): Date | undefined {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return undefined;
  const date = new Date(value);
  if (!Number.isFinite(date.getTime()) || formatLocalDateTimeInput(date) !== value) return undefined;
  return date;
}
