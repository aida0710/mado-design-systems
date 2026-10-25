/*
 * アクセストークンの期限の選び方。決まった日数、無期限、分・時間・日での入力、カレンダーでの日時の
 * どれかを選び、APIには期限の日時（ISO 8601）か、無期限のnullを渡す。
 */
import { formatLocalDateTimeInput, parseLocalDateTimeInput } from './datetimeInput';

/** 選択肢に並べる日数。既定は90日。 */
export const TOKEN_EXPIRY_PRESET_DAYS = [7, 30, 90, 365] as const;
export type TokenExpiryOption = `${(typeof TOKEN_EXPIRY_PRESET_DAYS)[number]}` | 'never' | 'custom' | 'calendar';
export type TokenExpiryUnit = 'minutes' | 'hours' | 'days';

export interface TokenExpirySelection {
  option: TokenExpiryOption;
  /** optionが'custom'のときの長さ。入力欄の文字のまま持つ（小数も可）。 */
  duration: string;
  unit: TokenExpiryUnit;
  /** optionが'calendar'のときのdatetime-localの値。 */
  dateTime: string;
}

export const DEFAULT_TOKEN_EXPIRY_SELECTION: TokenExpirySelection = {
  option: '90',
  duration: '90',
  unit: 'days',
  dateTime: '',
};

const UNIT_MILLISECONDS: Record<TokenExpiryUnit, number> = {
  minutes: 60 * 1000,
  hours: 60 * 60 * 1000,
  days: 24 * 60 * 60 * 1000,
};

/** 期限の日時。nullは無期限、undefinedは未来の日時にならない（空欄・過去・あり得ない日時）。 */
export function resolveTokenExpiryTimestamp(
  selection: TokenExpirySelection,
  now = Date.now(),
): string | null | undefined {
  if (selection.option === 'never') return null;
  if (selection.option === 'calendar') {
    const expiresAt = parseLocalDateTimeInput(selection.dateTime);
    if (!expiresAt || expiresAt.getTime() <= now) return undefined;
    return expiresAt.toISOString();
  }
  const duration = Number(selection.option === 'custom' ? selection.duration : selection.option);
  const unit = selection.option === 'custom' ? selection.unit : 'days';
  if (!Number.isFinite(duration) || duration <= 0) return undefined;
  const expiresAt = new Date(now + duration * UNIT_MILLISECONDS[unit]);
  if (!Number.isFinite(expiresAt.getTime()) || expiresAt.getTime() <= now) return undefined;
  return expiresAt.toISOString();
}

/**
 * 選択肢を替える。カレンダーに替えたときは、それまで選んでいた長さの日時を初期値にする。
 * 一度入れた日時は、ほかの選択肢を行き来しても残す。
 */
export function changeTokenExpiryOption(
  selection: TokenExpirySelection,
  option: TokenExpiryOption,
  now = Date.now(),
): TokenExpirySelection {
  if (option !== 'calendar' || selection.dateTime) return { ...selection, option };
  const expiresAt =
    resolveTokenExpiryTimestamp(selection, now) ?? resolveTokenExpiryTimestamp(DEFAULT_TOKEN_EXPIRY_SELECTION, now);
  return { ...selection, option, dateTime: expiresAt ? formatLocalDateTimeInput(new Date(expiresAt)) : '' };
}
