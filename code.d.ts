/** プレビューするテキストの表示形式。 */
export type CodeLanguage =
  | 'plaintext'
  | 'json'
  | 'yaml'
  | 'toml'
  | 'ini'
  | 'properties'
  | 'xml'
  | 'markdown'
  | 'python'
  | 'bash'
  | 'sql'
  | 'dockerfile'
  | 'csv'
  | 'tsv'
  | 'log';

export interface CodeLanguageInfo {
  id: CodeLanguage;
  /** 形式そのものの名前。'Text'と'Log'は、アプリが選択欄用に翻訳する。 */
  name: string;
}

/** プレビューで選べる表示形式。選択欄の並び順。 */
export declare const CODE_LANGUAGES: readonly CodeLanguageInfo[];

/** 色付けはここまで。これより長いテキストの残りは、色を付けずにそのまま出す。 */
export declare const HIGHLIGHT_MAX_CHARS: number;

export declare function isCodeLanguage(value: unknown): value is CodeLanguage;

/** ファイル名から分かる形式。分からなければ（拡張子が無い・不明・.txt）null。 */
export declare function languageFromName(fileName: string | null | undefined): CodeLanguage | null;

/** メディアタイプから分かる形式。text/plainやoctet-streamなどではnull。 */
export declare function languageFromMimeType(mimeType: string | null | undefined): CodeLanguage | null;

/** 先頭の数行から見て、中身がどの形式に見えるか。どれにも当てはまらなければプレーンテキスト。 */
export declare function guessLanguage(text: string): CodeLanguage;

/** ファイル名、メディアタイプ、中身の順に形式を決める。 */
export declare function detectLanguage(input: {
  fileName?: string | null;
  mimeType?: string | null;
  text: string;
}): CodeLanguage;

export declare function escapeHtml(text: string): string;

/**
 * .code-viewの中の<code>に入れるHTML。テキストをエスケープし、色ごとにspanで囲む。大きなプレビュー
 * でも操作が重くならないよう、色を付けるのは先頭のHIGHLIGHT_MAX_CHARS文字だけ。
 */
export declare function highlightCode(text: string, language: CodeLanguage): string;
