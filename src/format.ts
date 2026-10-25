/*
 * サイズと経過時間を、人が読む形にする。呼び出し側は表示言語のIntlのロケール（'ja-JP'など）を
 * 渡す。
 */

const BYTES_PER_BINARY_UNIT = 1024;
const BINARY_BYTE_UNITS = ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB'];
// バイトより大きい単位はすべて小数1桁にし、列に並んだサイズや"sent / total"の桁をそろえる。
const BYTE_UNIT_FRACTION_DIGITS = 1;

// "5 minutes ago"の段階。次に大きい単位で表せるまで、その単位を使う。
const RELATIVE_TIME_UNITS: Array<{ unit: Intl.RelativeTimeFormatUnit; seconds: number }> = [
  { unit: 'year', seconds: 365 * 24 * 60 * 60 },
  { unit: 'month', seconds: 30 * 24 * 60 * 60 },
  { unit: 'week', seconds: 7 * 24 * 60 * 60 },
  { unit: 'day', seconds: 24 * 60 * 60 },
  { unit: 'hour', seconds: 60 * 60 },
  { unit: 'minute', seconds: 60 },
];

/** Intlのロケールごとにフォーマッターを1つ持つ。作るのに時間がかかり、長い表では遅さが目に見えるため。 */
function memoizePerIntlLocale<Formatter>(create: (intlLocale: string) => Formatter) {
  const formatters = new Map<string, Formatter>();
  return (intlLocale: string): Formatter => {
    let formatter = formatters.get(intlLocale);
    if (formatter === undefined) {
      formatter = create(intlLocale);
      formatters.set(intlLocale, formatter);
    }
    return formatter;
  };
}

const getByteUnitNumberFormat = memoizePerIntlLocale(
  (intlLocale) =>
    new Intl.NumberFormat(intlLocale, {
      minimumFractionDigits: BYTE_UNIT_FRACTION_DIGITS,
      maximumFractionDigits: BYTE_UNIT_FRACTION_DIGITS,
    }),
);
const getRelativeTimeFormat = memoizePerIntlLocale(
  (intlLocale) => new Intl.RelativeTimeFormat(intlLocale, { numeric: 'auto' }),
);

const roundToShownDigits = (value: number) =>
  Math.round(value * 10 ** BYTE_UNIT_FRACTION_DIGITS) / 10 ** BYTE_UNIT_FRACTION_DIGITS;

/** "1.5 MiB"。1024で割るので、2進の単位を使う。 */
export function formatBytes(bytes: number, intlLocale: string): string {
  let unitIndex = Math.min(
    Math.floor(Math.log(Math.max(bytes, 1)) / Math.log(BYTES_PER_BINARY_UNIT)),
    BINARY_BYTE_UNITS.length - 1,
  );
  if (unitIndex === 0) return `${Math.round(bytes)} B`;
  // 1023.96 KiBは丸めると"1024.0 KiB"になるので、代わりに1.0 MiBと表す。
  if (roundToShownDigits(bytes / BYTES_PER_BINARY_UNIT ** unitIndex) >= BYTES_PER_BINARY_UNIT) {
    unitIndex = Math.min(unitIndex + 1, BINARY_BYTE_UNITS.length - 1);
  }
  const value = getByteUnitNumberFormat(intlLocale).format(bytes / BYTES_PER_BINARY_UNIT ** unitIndex);
  return `${value} ${BINARY_BYTE_UNITS[unitIndex]}`;
}

/** "5分前"、"yesterday"などの形。`now`から測る。時計が少し進んでいて未来になった時刻は「今」と表す。 */
export function formatRelativeTime(
  value: string | number | Date,
  { intlLocale, now = Date.now() }: { intlLocale: string; now?: number },
): string {
  const relativeTimeFormat = getRelativeTimeFormat(intlLocale);
  const elapsedSeconds = Math.max(0, (now - new Date(value).getTime()) / 1000);
  for (const { unit, seconds } of RELATIVE_TIME_UNITS) {
    if (elapsedSeconds >= seconds) {
      return relativeTimeFormat.format(-Math.floor(elapsedSeconds / seconds), unit);
    }
  }
  return relativeTimeFormat.format(0, 'second');
}

/** 上部バーの丸い印に出す名前の頭文字（2文字まで）。二語以上なら各語の頭、一語なら先頭の二文字。 */
export function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const letters =
    words.length > 1 ? words.slice(0, 2).map((word) => [...word][0] ?? '') : [...(words[0] ?? '')].slice(0, 2);
  return letters.join('').toUpperCase();
}
