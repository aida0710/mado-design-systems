/*
 * Sizes and elapsed times as people read them. The caller passes the Intl locale of the display
 * language, such as 'ja-JP'.
 */

const BYTES_PER_BINARY_UNIT = 1024;
const BINARY_BYTE_UNITS = ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB'];
// One decimal place in every unit above bytes, so sizes in a column and "sent / total" line up.
const BYTE_UNIT_FRACTION_DIGITS = 1;

// Steps for "5 minutes ago": each unit is used until the next larger one fits.
const RELATIVE_TIME_UNITS: Array<{ unit: Intl.RelativeTimeFormatUnit; seconds: number }> = [
  { unit: 'year', seconds: 365 * 24 * 60 * 60 },
  { unit: 'month', seconds: 30 * 24 * 60 * 60 },
  { unit: 'week', seconds: 7 * 24 * 60 * 60 },
  { unit: 'day', seconds: 24 * 60 * 60 },
  { unit: 'hour', seconds: 60 * 60 },
  { unit: 'minute', seconds: 60 },
];

/** Keeps one formatter per Intl locale; building them is slow enough to show in long tables. */
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

/** "1.5 MiB": binary units, since the sizes are divided by 1024. */
export function formatBytes(bytes: number, intlLocale: string): string {
  let unitIndex = Math.min(
    Math.floor(Math.log(Math.max(bytes, 1)) / Math.log(BYTES_PER_BINARY_UNIT)),
    BINARY_BYTE_UNITS.length - 1,
  );
  if (unitIndex === 0) return `${Math.round(bytes)} B`;
  // 1023.96 KiB would round to "1024.0 KiB"; it reads as 1.0 MiB instead.
  if (roundToShownDigits(bytes / BYTES_PER_BINARY_UNIT ** unitIndex) >= BYTES_PER_BINARY_UNIT) {
    unitIndex = Math.min(unitIndex + 1, BINARY_BYTE_UNITS.length - 1);
  }
  const value = getByteUnitNumberFormat(intlLocale).format(bytes / BYTES_PER_BINARY_UNIT ** unitIndex);
  return `${value} ${BINARY_BYTE_UNITS[unitIndex]}`;
}

/** "5分前", "yesterday" ... measured from `now`. A clock slightly ahead reads as now. */
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
