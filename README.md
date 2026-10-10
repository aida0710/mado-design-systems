# Mado Design System

MadoとMado Model Trackingが共有するデザインシステムです。npmのパッケージ名は`@mado/design-system`です。色・書体・角丸の変数のほか、要素の既定、共通の部品、画面の枠（上部バー・サイドバー・ドロワー・ログイン画面）、テキストのプレビューの色付けを持ち、両アプリが同じclass名で使います。

| ファイル | 内容 |
|---|---|
| `tokens.css` | ライトとダークの配色、状態バッジ、上部バー、ログ表示とコードの色、影、角丸、書体の並び、タップ領域の最小サイズ（`--tap-target`） |
| `fonts.css` | IBM Plex Sans・IBM Plex MonoのLatin subset（`fonts/`、SIL OFL 1.1） |
| `base.css` | 要素の既定（本文の書体と大きさ、入力欄、リンク、フォーカスの枠、見出し、コード）と小さな補助class（`.muted`・`.mono`・`.sr-only`など） |
| `components.css` | ボタン（`.button`・`.icon-button`・`.link-button`）、通知（`.notice`）、ページの見出し（`.page-header`）、区切りの見出し（`.section-heading`）、項目と値の一覧（`.details-list`）、JSONの表示（`.json-view`）、タブ（`.tabs`・`.tab`）、入力欄（`.field`）、ダイアログ（`.dialog`）、表、状態バッジ（`.status-badge`）、ポップオーバー、狭い幅で列を減らす表（`.responsive-table`） |
| `shell.css` | 上部バー（`.topbar`）、サイドバー（`.navigation-sidebar`）とアイコンだけの列、幅を変える境目、ドロワー（`.navigation-drawer`）、ログイン画面（`.login-page`） |
| `code.css` | 暗い地のコード表示（`.code-view`）と表示形式の選択欄（`.code-format`）、`code.js`が付ける色のclass |
| `code.js`・`code.d.ts` | テキストの形式の推測と色付け（`@mado/design-system/code`）。highlight.jsを使います |

日本語の書体（Noto Sans JP）は各アプリが`@fontsource/noto-sans-jp`で同梱します。

## 入れ方

GitHub Releaseに添付したtarballに依存します。npmのregistryには出していません。

```sh
npm install https://github.com/aida0710/mado-design-systems/releases/download/v0.4.0/mado-design-system-0.4.0.tgz
```

`package.json`には`"@mado/design-system": "https://github.com/…/mado-design-system-0.4.0.tgz"`として入り、`package-lock.json`にtarballのハッシュ（`integrity`）が残ります。リポジトリは公開なので、CIやDockerのビルドでも認証は要りません。

テキストの色付け（`@mado/design-system/code`）を使うアプリは、`highlight.js`（11.11以上）も自分の依存に入れます。highlight.jsは省略できるpeer dependencyで、CSSだけを使うアプリには要りません。

## 使い方

各アプリの入口で、ほかのスタイルより先に、この順に読み込みます。

```ts
import '@mado/design-system/fonts.css';
import '@mado/design-system/tokens.css';
import '@mado/design-system/base.css';
import '@mado/design-system/components.css';
import '@mado/design-system/shell.css';
// テキストのプレビューに色を付けるとき
import '@mado/design-system/code.css';
```

ダークテーマは`<html data-theme="dark">`のときに有効になります。

- Mado Model Tracking: `apps/web`が依存し、`main.tsx`で上の順に読み込みます。
- Mado: `front/`が依存します。`base.css`・`components.css`・`shell.css`・`code.css`は、どれも`@layer components`に入れて読み込みます（`@import "@mado/design-system/base.css" layer(components);`）。Tailwind v4のpreflight（`@layer base`）より強く、ユーティリティclassより弱くなり、共通のCSSどうしの優先順位はlayerを使わないMado Model Trackingと同じになります（要素の指定より`.numeric`などのclassが勝つ）。

### 画面の枠のclassと属性

- `.app-shell[data-navigation]`: サイドバーの形。`sidebar`（名前とアイコン）、`rail`（アイコンだけ）、`drawer`（上部バーのメニューボタンから開く）のどれかをアプリが入れます。`sidebar`のときは`.brand`（アプリ名）がサイドバーと同じ幅になります。
- `.navigation-sidebar`と`.navigation-drawer`は、ライト・ダークのどちらのテーマでも上部バーと同じ暗い色（`--header`で始まる変数）で描きます。上部バーとナビゲーションをひと続きの枠にして、画面の中身と分けるためです。選択中の項目と、フォーカスの印には`--header-indicator`を使います。
- `.navigation-sidebar[data-collapsed='true']`: アイコンだけの列にします。名前は`.navigation-label`に入れて読み上げ用に残し、`title`でツールチップにします。
- `.navigation-resize-handle`: サイドバーの右の境目。幅はアプリが`.app-shell`に`--navigation-width`を書いて変えます。ドラッグ中は`data-dragging='true'`を付けます。
- 切り替える幅は両アプリで同じにします。1200px以上は`sidebar`（手で`rail`に畳める）、900px以上1200px未満は`rail`、900px未満は`drawer`です。

### テキストの色付け

```ts
import { detectLanguage, highlightCode } from '@mado/design-system/code';

const language = detectLanguage({ fileName, mimeType, text });
// <pre class="code-view"><code>の中身。文字は逃がしてあり、足すのは色のための<span class>だけです。
const html = highlightCode(text, language);
```

- 形式は`CODE_LANGUAGES`の15種類です。テキスト（色なし）、JSON（JSON Linesも）、YAML、TOML、INI（`.cfg`・`.conf`も）、.env / properties、XML / HTML、Markdown、Python、Shell、SQL、Dockerfile、CSV、TSV、ログです。TOMLはhighlight.jsのINIの文法で色を付けます。CSVとTSVは列ごとに6色を繰り返し、ログは行頭の時刻とレベル（ERROR・WARN・INFO・DEBUGなど）に色を付けます。
- `detectLanguage`は、ファイル名（拡張子と`Dockerfile`・`.env`などの名前）、メディアタイプ、中身の先頭8,192文字の順に形式を決め、どれにも当たらなければ`plaintext`にします。
- 色を付けるのは先頭の`HIGHLIGHT_MAX_CHARS`（200,000文字）までで、残りは逃がすだけにします。
- 色は`tokens.css`の`--code-*`です。地の`--code-background`はライトとダークで同じ暗い色で、どの色も地に対して4.5:1以上にしています。
- 利用者が選び直した形式の保存は各アプリが持ちます（Mado Model Trackingは`mmt.codeLanguage`、Madoは`mado.codeLanguage`）。

## 変数と部品を足す・変えるときの決まり

- 名前は見た目でなく役割で付けます（`--teal`ではなく`--accent`）。
- 色は`tokens.css`の変数にだけ値で書き、ほかのファイルは変数を使います。文字色は、置かれる面（`--background`〜`--selected`、tintの地）のすべてで4.5:1以上にします（WCAG AA）。フォーカスの印や入力欄の枠は3:1以上にします。
- ライトだけで足した色は、ダークでも見えるかを確かめ、必要なら`:root[data-theme='dark']`にも書きます。
- 角丸は`--radius-none`（入力・ボタン・表）、`--radius-sm`（小さな部品・パネル）、`--radius-pill`（バッジ）の3段です。円は`50%`を使います。
- メディアクエリは640px・900px・1200pxの3つだけを、範囲の書き方（`@media (width < 900px)`）で書きます。
- 部品のclassを足すときは、片方のアプリだけで使うものは各アプリに置き、両方で使うものだけをここに置きます。
- MadoはTailwind v4を使います。Tailwindの既定テーマと同じ名前の変数（今は`--radius-sm`）は、layerの外に書く`tokens.css`の値が優先されます。新しい名前はTailwindの既定テーマ（`--color-*`、`--text-*`、`--shadow-sm`など）と重ならないものにします。

`npm test`が、上の決まり（色の値、未定義の変数、ダークだけの変数、メディアクエリ）、文字色のコントラスト、形式の推測と色付けを確かめます。各アプリのテストも、アプリのCSSがこのパッケージの変数を使っているかを確かめます。

## 開発

```sh
npm ci
npm test
```

pull requestとmainへのpushで、GitHub Actions（`.github/workflows/ci.yml`）が同じテストと`npm pack --dry-run`を実行します。

## 版を上げて配る

1. `package.json`の`version`を上げ、`CHANGELOG.md`にその版の節（例: `## 0.5.0`）を足します。
2. mainへ入れます。GitHub Actions（`.github/workflows/release.yml`）が、その版のGitHub Releaseがまだ無ければ、テストと`npm pack`を行い、タグ（例: `v0.5.0`）とtarballを添付したReleaseを作ります。`CHANGELOG.md`にその版の節が無いと止まります。版を上げないcommitでは何もしません。
3. 各アプリの依存のURLを新しい版に替えて`npm install`します（Mado: `front/`、Mado Model Tracking: `apps/web`）。

Releaseの作成に失敗したときは、直したcommitをmainへ入れるか、ActionsのRelease workflowを手で実行（Run workflow）し直します。

一度公開した版のtarballは差し替えません。差し替えると、各アプリのlockfileの`integrity`と合わなくなります。直すときは版を上げます。

## ライセンス

[Apache License 2.0](LICENSE)です。同梱のIBM Plexは[SIL Open Font License 1.1](fonts/OFL.txt)です。テキストの色付けが使う[highlight.js](https://highlightjs.org/)（BSD-3-Clause）は同梱せず、使うアプリが依存に入れます。
