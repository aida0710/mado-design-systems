import { useMemo, useState } from 'react';
import { detectLanguage, isCodeLanguage, type CodeLanguage } from '@mado/design-system/code';
import { readStorage, writeStorage } from '../storage.js';

/** 'auto'は判定した形式に従う。ほかの値は利用者が選んだ形式。 */
export type CodeLanguageChoice = CodeLanguage | 'auto';

// .txtには何でも入るので、ある.txtで選んだ形式は次の.txtには当てはまらない。
const UNREMEMBERED_EXTENSIONS = new Set(['txt', 'text']);

/**
 * 選んだ形式を覚えるキー。拡張子、.envのファイルは'.env'、Dockerfileは'dockerfile'。拡張子の
 * 無いほかの名前と.txtは''になり、選んだ形式を覚えない。
 */
export function codeLanguageKey(fileName: string | null | undefined): string {
  const name = (fileName ?? '').split('/').pop()?.toLowerCase() ?? '';
  if (name === '.env' || name.startsWith('.env.')) return '.env';
  if (name === 'dockerfile' || name.startsWith('dockerfile.')) return 'dockerfile';
  const dot = name.lastIndexOf('.');
  const extension = dot > 0 ? name.slice(dot + 1) : '';
  return UNREMEMBERED_EXTENSIONS.has(extension) ? '' : extension;
}

function readChoices(storageKey: string): Record<string, CodeLanguage> {
  try {
    const stored: unknown = JSON.parse(readStorage(storageKey) ?? '{}');
    if (!stored || typeof stored !== 'object') return {};
    return Object.fromEntries(Object.entries(stored).filter(([, value]) => isCodeLanguage(value)));
  } catch {
    return {};
  }
}

function storedChoice(storageKey: string, key: string): CodeLanguageChoice {
  if (!key) return 'auto';
  const choices = readChoices(storageKey);
  // 自身のキーだけを引く。"notes.constructor"という名前のファイルでObjectのメンバーを読まないように。
  return Object.hasOwn(choices, key) ? (choices[key] ?? 'auto') : 'auto';
}

function writeChoice(storageKey: string, key: string, choice: CodeLanguageChoice): void {
  const choices = readChoices(storageKey);
  if (choice === 'auto') delete choices[key];
  else choices[key] = choice;
  writeStorage(storageKey, JSON.stringify(choices));
}

export interface CodeLanguageState {
  /** ファイル名・メディアタイプ・中身から判定した形式。 */
  detected: CodeLanguage;
  choice: CodeLanguageChoice;
  /** テキストの色付けに使う形式。 */
  language: CodeLanguage;
  setChoice: (choice: CodeLanguageChoice) => void;
}

/**
 * プレビューするテキストの形式。判定した形式（code.js）を使うが、利用者がこの種類のファイルに
 * 形式を選んでいればそれを使う。選んだ形式は`storageKey`の下に拡張子ごとに保存する。
 */
export function useCodeLanguage({
  storageKey,
  fileName,
  mimeType,
  text,
}: {
  storageKey: string;
  fileName: string | null | undefined;
  mimeType?: string;
  text: string;
}): CodeLanguageState {
  const detected = useMemo(() => detectLanguage({ fileName, mimeType, text }), [fileName, mimeType, text]);
  const key = codeLanguageKey(fileName);
  // このプレビューで選んだ形式。別のファイル（別のキー）は、自分の選んだ形式を保存先から読む。
  const [picked, setPicked] = useState<{ key: string; choice: CodeLanguageChoice } | null>(null);
  const choice = picked?.key === key ? picked.choice : storedChoice(storageKey, key);
  return {
    detected,
    choice,
    language: choice === 'auto' ? detected : choice,
    setChoice: (next) => {
      setPicked({ key, choice: next });
      if (key) writeChoice(storageKey, key, next);
    },
  };
}
