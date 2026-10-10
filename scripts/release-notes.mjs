// Prints the notes of a GitHub Release: the version's section of CHANGELOG.md and how to install
// the attached tarball. Usage: node scripts/release-notes.mjs <version>
import { readFileSync } from 'node:fs';

const version = process.argv[2];
if (!version) throw new Error('Usage: node scripts/release-notes.mjs <version>');
const repository = process.env.GITHUB_REPOSITORY ?? 'aida0710/mado-design-systems';
const changelog = readFileSync(new URL('../CHANGELOG.md', import.meta.url), 'utf8').split('\n');
const start = changelog.findIndex((line) => line.trim() === `## ${version}`);
if (start < 0) throw new Error(`CHANGELOG.md has no section "## ${version}"`);
const end = changelog.findIndex((line, index) => index > start && line.startsWith('## '));
const section = changelog.slice(start + 1, end < 0 ? undefined : end).join('\n').trim();
const url = `https://github.com/${repository}/releases/download/v${version}/mado-design-system-${version}.tgz`;

console.log(`${section}

## 入れ方

\`\`\`sh
npm install ${url}
\`\`\`
`);
