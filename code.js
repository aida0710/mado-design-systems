/*
 * プレビューするテキストファイルの形式を選び、コードの表示（code.css）用に色を付ける。
 * mado S3 Data Catalogとmado ML Trackingが共有する。選択欄と、利用者が選んだ形式の保存は各アプリが
 * 持つ。highlight.jsが持つ文法はhighlight.jsが色を付け、CSV・TSV・ログはここで色を付ける。
 */
import hljs from 'highlight.js/lib/core';
import bash from 'highlight.js/lib/languages/bash';
import dockerfile from 'highlight.js/lib/languages/dockerfile';
import ini from 'highlight.js/lib/languages/ini';
import json from 'highlight.js/lib/languages/json';
import markdown from 'highlight.js/lib/languages/markdown';
import properties from 'highlight.js/lib/languages/properties';
import python from 'highlight.js/lib/languages/python';
import sql from 'highlight.js/lib/languages/sql';
import xml from 'highlight.js/lib/languages/xml';
import yaml from 'highlight.js/lib/languages/yaml';

hljs.registerLanguage('bash', bash);
hljs.registerLanguage('dockerfile', dockerfile);
hljs.registerLanguage('ini', ini);
hljs.registerLanguage('json', json);
hljs.registerLanguage('markdown', markdown);
hljs.registerLanguage('properties', properties);
hljs.registerLanguage('python', python);
hljs.registerLanguage('sql', sql);
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('yaml', yaml);

/** プレビューで選べる表示形式。選択欄の並び順。 */
export const CODE_LANGUAGES = [
  { id: 'plaintext', name: 'Text' },
  { id: 'json', name: 'JSON' },
  { id: 'yaml', name: 'YAML' },
  { id: 'toml', name: 'TOML' },
  { id: 'ini', name: 'INI' },
  { id: 'properties', name: '.env / properties' },
  { id: 'xml', name: 'XML / HTML' },
  { id: 'markdown', name: 'Markdown' },
  { id: 'python', name: 'Python' },
  { id: 'bash', name: 'Shell' },
  { id: 'sql', name: 'SQL' },
  { id: 'dockerfile', name: 'Dockerfile' },
  { id: 'csv', name: 'CSV' },
  { id: 'tsv', name: 'TSV' },
  { id: 'log', name: 'Log' },
];

const LANGUAGE_IDS = new Set(CODE_LANGUAGES.map((language) => language.id));

// 各形式に使うhighlight.jsの文法。TOMLはINIに十分近いので、INIの文法を使う。
const GRAMMARS = {
  json: 'json',
  yaml: 'yaml',
  toml: 'ini',
  ini: 'ini',
  properties: 'properties',
  xml: 'xml',
  markdown: 'markdown',
  python: 'python',
  bash: 'bash',
  sql: 'sql',
  dockerfile: 'dockerfile',
};

const EXTENSIONS = {
  json: 'json',
  jsonl: 'json',
  ndjson: 'json',
  jsonc: 'json',
  geojson: 'json',
  ipynb: 'json',
  webmanifest: 'json',
  yaml: 'yaml',
  yml: 'yaml',
  toml: 'toml',
  ini: 'ini',
  cfg: 'ini',
  conf: 'ini',
  cnf: 'ini',
  service: 'ini',
  desktop: 'ini',
  properties: 'properties',
  env: 'properties',
  xml: 'xml',
  html: 'xml',
  htm: 'xml',
  xhtml: 'xml',
  svg: 'xml',
  xsd: 'xml',
  xsl: 'xml',
  xslt: 'xml',
  plist: 'xml',
  kml: 'xml',
  gpx: 'xml',
  rss: 'xml',
  md: 'markdown',
  markdown: 'markdown',
  py: 'python',
  pyi: 'python',
  pyw: 'python',
  sh: 'bash',
  bash: 'bash',
  zsh: 'bash',
  ksh: 'bash',
  sql: 'sql',
  csv: 'csv',
  tsv: 'tsv',
  tab: 'tsv',
  log: 'log',
};

const MIME_TYPES = {
  'application/json': 'json',
  'application/x-ndjson': 'json',
  'application/ndjson': 'json',
  'application/jsonl': 'json',
  'application/yaml': 'yaml',
  'application/x-yaml': 'yaml',
  'text/yaml': 'yaml',
  'text/x-yaml': 'yaml',
  'application/toml': 'toml',
  'text/csv': 'csv',
  'text/tab-separated-values': 'tsv',
  'application/xml': 'xml',
  'text/xml': 'xml',
  'text/html': 'xml',
  'text/markdown': 'markdown',
  'text/x-markdown': 'markdown',
  'text/x-python': 'python',
  'text/x-script.python': 'python',
  'application/x-sh': 'bash',
  'application/x-shellscript': 'bash',
  'text/x-shellscript': 'bash',
  'application/sql': 'sql',
  'text/x-sql': 'sql',
};

/** 色付けはここまで。これより長いテキストの残りは、色を付けずにそのまま出す。 */
export const HIGHLIGHT_MAX_CHARS = 200_000;

// 自身のキーだけを引く。"notes.constructor"のような名前でObjectのメンバーを拾わないように。
const lookup = (table, key) => (Object.hasOwn(table, key) ? table[key] : null);

export function isCodeLanguage(value) {
  return typeof value === 'string' && LANGUAGE_IDS.has(value);
}

/** ファイル名から分かる形式。分からなければ（拡張子が無い・不明・.txt）null。 */
export function languageFromName(fileName) {
  const name = String(fileName ?? '').split('/').pop().toLowerCase();
  if (!name) return null;
  if (name === 'dockerfile' || name === 'containerfile' || name.startsWith('dockerfile.') || name.endsWith('.dockerfile')) {
    return 'dockerfile';
  }
  if (name === '.env' || name.startsWith('.env.')) return 'properties';
  if (name === '.bashrc' || name === '.zshrc' || name === '.profile' || name === '.bash_profile') return 'bash';
  if (name === '.gitconfig' || name === '.editorconfig') return 'ini';
  const dot = name.lastIndexOf('.');
  if (dot < 0) return null;
  return lookup(EXTENSIONS, name.slice(dot + 1));
}

/** メディアタイプから分かる形式。text/plainやoctet-streamなどではnull。 */
export function languageFromMimeType(mimeType) {
  const type = String(mimeType ?? '').split(';')[0].trim().toLowerCase();
  if (!type) return null;
  if (Object.hasOwn(MIME_TYPES, type)) return MIME_TYPES[type];
  if (type.endsWith('+json')) return 'json';
  if (type.endsWith('+xml')) return 'xml';
  return null;
}

// 日時・時刻・レベルのどれかで始まる行。
const LOG_LINE =
  /^\s*(\[?\d{4}[-/]\d{2}[-/]\d{2}[ T]\d{1,2}:\d{2}|\[?\d{1,2}:\d{2}:\d{2}|\[?(TRACE|DEBUG|INFO|NOTICE|WARN|WARNING|ERROR|ERR|FATAL|CRITICAL)\]?[\s:])/;

// TOMLのテーブルの配列（[[tool.x]]）は、JSONの配列の配列と同じように始まる。
function looksLikeJson(trimmed) {
  if (/^\[\[\s*[\w."-]+\s*\]\]/.test(trimmed)) return false;
  return /^\{\s*("|\})/.test(trimmed) || /^\[\s*([[{"\]\d-]|true\b|false\b|null\b)/.test(trimmed);
}

// 先頭の数行が同じ列数（2列以上）に分かれるときの区切り文字。
function tableDelimiter(lines) {
  if (lines.length < 2) return null;
  const sample = lines.slice(0, 10);
  for (const delimiter of ['\t', ',']) {
    const counts = sample.map((line) => countOutsideQuotes(line, delimiter));
    if (counts[0] < 1) continue;
    const matching = counts.filter((count) => count === counts[0]).length;
    if (matching / counts.length >= 0.8) return delimiter;
  }
  return null;
}

function countOutsideQuotes(line, delimiter) {
  let count = 0;
  let quoted = false;
  for (const character of line) {
    if (character === '"') quoted = !quoted;
    else if (character === delimiter && !quoted) count += 1;
  }
  return count;
}

/**
 * 先頭の数行から見て、中身がどの形式に見えるか。強い手がかり（JSONやXMLの書き出し、shebang）を
 * 優先し、それ以外では大半の行が同じ形に見える必要がある。どれでもなければプレーンテキスト。
 */
export function guessLanguage(text) {
  const sample = String(text ?? '').slice(0, 8192);
  const trimmed = sample.trimStart();
  if (!trimmed) return 'plaintext';
  if ((trimmed[0] === '{' || trimmed[0] === '[') && looksLikeJson(trimmed)) return 'json';
  if (/^<(\?xml|!doctype|[a-z])/i.test(trimmed)) return 'xml';
  if (/^#!.*\b(ba|z|k)?sh\b/.test(trimmed)) return 'bash';
  if (/^#!.*\bpython/.test(trimmed)) return 'python';
  const lines = sample
    .split(/\r?\n/)
    .filter((line) => line.trim() !== '')
    .slice(0, 40);
  const share = (pattern) => lines.filter((line) => pattern.test(line)).length / lines.length;
  if (
    /^(FROM|ARG)\s+\S/i.test(trimmed) &&
    share(/^\s*(FROM|RUN|CMD|COPY|ADD|ENV|ARG|WORKDIR|EXPOSE|ENTRYPOINT|USER|LABEL|VOLUME|HEALTHCHECK|SHELL|#|\S.*\\$|\s)/i) >= 0.8
  ) {
    return 'dockerfile';
  }
  if (share(LOG_LINE) >= 0.5) return 'log';
  const delimiter = tableDelimiter(lines);
  if (delimiter === '\t') return 'tsv';
  if (delimiter === ',') return 'csv';
  if (/^\s*(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP|WITH)\b/i.test(trimmed) && /;\s*$/m.test(sample)) return 'sql';
  const sections = share(/^\s*\[\[?[^\]]+\]\]?\s*$/);
  const assignments = share(/^\s*[\w.-]+\s*=/);
  const comments = share(/^\s*[#;]/);
  if (sections > 0 && sections + assignments + comments >= 0.8) {
    return /^\s*[\w.-]+\s*=\s*("|'|\[|\{|true\b|false\b|-?\d)/m.test(sample) ? 'toml' : 'ini';
  }
  if (assignments > 0 && share(/^\s*(export\s+)?[A-Za-z_][\w.-]*\s*=/) + share(/^\s*#/) >= 0.8) return 'properties';
  if (
    share(/^\s*(-\s+)?("[^"]*"|'[^']*'|[\w./-]+)\s*:(\s|$)/) + share(/^\s*(#|-\s|---|\.\.\.)/) >= 0.7 &&
    share(/:(\s|$)/) >= 0.3
  ) {
    return 'yaml';
  }
  if (share(/^\s*(#{1,6}\s|[-*+]\s|\d+\.\s|>|```)/) >= 0.3 || /\[[^\]\n]+\]\([^)\s]+\)/.test(sample)) return 'markdown';
  if (share(/^\s*(def|class|import|from|if|elif|else|for|while|return|with|try|except|@)\b/) >= 0.3 && /:\s*$/m.test(sample)) {
    return 'python';
  }
  return 'plaintext';
}

/** ファイル名、メディアタイプ、中身の順に形式を決める。 */
export function detectLanguage({ fileName, mimeType, text }) {
  return languageFromName(fileName) ?? languageFromMimeType(mimeType) ?? guessLanguage(text);
}

export function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// 各セルを列ごとのspanで囲む。引用符で囲んだCSVのセルは、区切り文字や改行を含むことがある。
function colorizeTable(text, delimiter) {
  const parts = [];
  let cell = '';
  let column = 0;
  let quoted = false;
  const flush = () => {
    if (cell) parts.push(`<span class="code-column-${column % 6}">${escapeHtml(cell)}</span>`);
    cell = '';
  };
  for (const character of text) {
    if (character === '"' && delimiter === ',') {
      quoted = !quoted;
      cell += character;
    } else if (!quoted && character === delimiter) {
      flush();
      parts.push(character);
      column += 1;
    } else if (!quoted && character === '\n') {
      flush();
      parts.push('\n');
      column = 0;
    } else {
      cell += character;
    }
  }
  flush();
  return parts.join('');
}

const LOG_TIME =
  /^\s*\[?(\d{4}[-/]\d{2}[-/]\d{2}[ T]\d{1,2}:\d{2}(:\d{2}([.,]\d+)?)?(Z|[+-]\d{2}:?\d{2})?|\d{1,2}:\d{2}:\d{2}([.,]\d+)?)\]?/;
// 大文字の語。小文字や先頭だけ大文字の語は、角かっこの中かlevel=の後だけ。メッセージの中の
// "error"には色を付けない。
const LOG_LEVEL =
  /\b(TRACE|DEBUG|INFO|NOTICE|WARN|WARNING|ERROR|ERR|FATAL|CRITICAL|PANIC|SEVERE)\b|\[([Tt]race|[Dd]ebug|[Ii]nfo|[Nn]otice|[Ww]arn(?:ing)?|[Ee]rr(?:or)?|[Ff]atal|[Cc]ritical)\]|\blevel=["']?(trace|debug|info|notice|warn(?:ing)?|err(?:or)?|fatal|critical)\b/;
const LOG_SEVERITY = {
  trace: 'debug',
  debug: 'debug',
  info: 'info',
  notice: 'info',
  warn: 'warning',
  warning: 'warning',
  error: 'error',
  err: 'error',
  fatal: 'error',
  critical: 'error',
  panic: 'error',
  severe: 'error',
};

// 各行の先頭の時刻と、行の最初の80文字以内にある最初のレベル。
function colorizeLog(text) {
  return text
    .split('\n')
    .map((line) => {
      let html = '';
      let rest = line;
      const time = LOG_TIME.exec(rest);
      if (time && time[0].trim()) {
        html += `<span class="code-log-time">${escapeHtml(time[0])}</span>`;
        rest = rest.slice(time[0].length);
      }
      const level = LOG_LEVEL.exec(rest.slice(0, 80));
      if (level) {
        const word = (level[1] ?? level[2] ?? level[3]).toLowerCase();
        const severity = lookup(LOG_SEVERITY, word) ?? 'info';
        html += escapeHtml(rest.slice(0, level.index));
        html += `<span class="code-log-level code-log-${severity}">${escapeHtml(level[0])}</span>`;
        rest = rest.slice(level.index + level[0].length);
      }
      return html + escapeHtml(rest);
    })
    .join('\n');
}

function colorize(text, language) {
  if (language === 'csv') return colorizeTable(text, ',');
  if (language === 'tsv') return colorizeTable(text, '\t');
  if (language === 'log') return colorizeLog(text);
  const grammar = lookup(GRAMMARS, language);
  if (!grammar) return escapeHtml(text);
  return hljs.highlight(text, { language: grammar, ignoreIllegals: true }).value;
}

/**
 * .code-viewの中の<code>に入れるHTML。テキストをエスケープし、色ごとにspanで囲む。大きなプレビュー
 * でも操作が重くならないよう、色を付けるのは先頭のHIGHLIGHT_MAX_CHARS文字だけ。
 */
export function highlightCode(text, language) {
  const value = String(text ?? '');
  const end = value.length > HIGHLIGHT_MAX_CHARS ? coloredLength(value) : value.length;
  return colorize(value.slice(0, end), language) + escapeHtml(value.slice(end));
}

// 色付けは上限内の最後の完全な行の後で終える。そうできなければ、サロゲートペアの途中では切らない。
function coloredLength(value) {
  const newline = value.lastIndexOf('\n', HIGHLIGHT_MAX_CHARS - 1);
  if (newline >= 0) return newline + 1;
  const last = value.charCodeAt(HIGHLIGHT_MAX_CHARS - 1);
  return last >= 0xd800 && last <= 0xdbff ? HIGHLIGHT_MAX_CHARS - 1 : HIGHLIGHT_MAX_CHARS;
}
