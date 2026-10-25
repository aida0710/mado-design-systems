import { useMemo, useState } from 'react';
import { detectLanguage, isCodeLanguage, type CodeLanguage } from '@mado/design-system/code';
import { readStorage, writeStorage } from '../storage';

/** 'auto' follows the detected format; any other value is the format the user picked. */
export type CodeLanguageChoice = CodeLanguage | 'auto';

// .txt holds anything, so a pick for one .txt file says nothing about the next.
const UNREMEMBERED_EXTENSIONS = new Set(['txt', 'text']);

/**
 * The key a pick is remembered under: the extension, '.env' for .env files and 'dockerfile' for
 * Dockerfiles. Other names without an extension and .txt get '' and their pick is not remembered.
 */
export function codeLanguageKey(fileName: string): string {
  const name = fileName.split('/').pop()?.toLowerCase() ?? '';
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
  // Own keys only, so a file named "notes.constructor" does not read Object's members.
  return Object.hasOwn(choices, key) ? (choices[key] ?? 'auto') : 'auto';
}

function writeChoice(storageKey: string, key: string, choice: CodeLanguageChoice): void {
  const choices = readChoices(storageKey);
  if (choice === 'auto') delete choices[key];
  else choices[key] = choice;
  writeStorage(storageKey, JSON.stringify(choices));
}

export interface CodeLanguageState {
  /** The format detected from the file name, media type and content. */
  detected: CodeLanguage;
  choice: CodeLanguageChoice;
  /** The format the text is colored as. */
  language: CodeLanguage;
  setChoice: (choice: CodeLanguageChoice) => void;
}

/**
 * The format of a previewed text: detected (code.js), unless the user picked one for files of this
 * kind, which is saved per extension under `storageKey`.
 */
export function useCodeLanguage({
  storageKey,
  fileName,
  mimeType,
  text,
}: {
  storageKey: string;
  fileName: string;
  mimeType?: string;
  text: string;
}): CodeLanguageState {
  const detected = useMemo(() => detectLanguage({ fileName, mimeType, text }), [fileName, mimeType, text]);
  const key = codeLanguageKey(fileName);
  // The pick made in this preview. Another file (another key) reads its own pick from storage.
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
