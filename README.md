# mado Design System

mado S3 Data Catalogとmado ML Trackingが共有するデザインシステムです。npmのパッケージ名は`@mado/design-system`です。色・書体・角丸・文字の大きさの変数のほか、要素の既定、共通の部品、画面の枠（上部バー・サイドバー・ドロワー・ログイン画面）、テキストのプレビューの色付けを持ち、両アプリが同じclass名で使います。0.6.0からは、両アプリにあった同じ処理（画面幅・表示言語・テーマ・書式・クリップボード・Monacoの配色）とReactの部品（ダイアログ・サイドバー・ドロワー・表示言語の選択など）も持ちます。

| ファイル | 内容 |
|---|---|
| `tokens.css` | ライトとダークの配色、状態バッジ、上部バー、ログ表示とコードの色、影、角丸、書体の並び、タップ領域の最小サイズ（`--tap-target`） |
| `fonts.css` | IBM Plex Sans・IBM Plex MonoのLatin subset（`fonts/`、SIL OFL 1.1） |
| `base.css` | 要素の既定（本文の書体と大きさ、入力欄、リンク、フォーカスの枠、見出し、コード）と小さな補助class（`.muted`・`.mono`・`.sr-only`など） |
| `components.css` | ボタン（`.button`・`.icon-button`・`.link-button`）、通知（`.notice`）、ページの見出し（`.page-header`）、区切りの見出し（`.section-heading`）、項目と値の一覧（`.details-list`）、JSONの表示（`.json-view`）、タブ（`.tabs`・`.tab`）、入力欄（`.field`）、ダイアログ（`.dialog`）、表、状態バッジ（`.status-badge`と役割の`.status-success`・`.status-info`・`.status-danger`・`.status-neutral`・`.status-attention`・`.status-accent`）、ポップオーバーとメニュー（`.popover`・`.menu`・`.menu-item`）、一覧の上の帯（`.toolbar`・`.toolbar-search`・`.toolbar-item`）、パンくず（`.breadcrumbs`）、狭い幅で列を減らす表（`.responsive-table`）、rechartsの軸の色 |
| `shell.css` | 上部バー（`.topbar`）、サイドバー（`.navigation-sidebar`）とアイコンだけの列、幅を変える境目、ドロワー（`.navigation-drawer`）、ログイン画面（`.login-page`） |
| `lineage.css` | 来歴のグラフ（React Flow）の色、項目のカード（`.lineage-node-card`）、検索欄（`.lineage-search-field`）。項目の種類の色は各アプリが`--lineage-kind-color`で決める |
| `docs.css` | ドキュメントサイト（VitePress）のテーマ。上部バーとサイドバーをアプリと同じ暗い枠にする。`tokens.css`と`fonts.css`の後に読み込む |
| `code.css` | 暗い地のコード表示（`.code-view`）と表示形式の選択欄（`.code-format`）、`code.js`が付ける色のclass |
| `code.js`・`code.d.ts` | テキストの形式の推測と色付け（`@mado/design-system/code`）。highlight.jsを使います |
| `dist/`（`src/`から作る） | 両アプリ共通の処理とReactの部品。下の「共通の処理とReactの部品」を参照 |

日本語の書体（Noto Sans JP）は各アプリが`@fontsource/noto-sans-jp`で同梱します。

## 入れ方

GitHub Releaseに添付したtarballに依存します。npmのregistryには出していません。

```sh
npm install https://github.com/aida0710/mado-design-systems/releases/download/v0.7.1/mado-design-system-0.7.1.tgz
```

`package.json`には`"@mado/design-system": "https://github.com/…/mado-design-system-0.7.1.tgz"`として入り、`package-lock.json`にtarballのハッシュ（`integrity`）が残ります。リポジトリは公開なので、CIやDockerのビルドでも認証は要りません。

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

- mado ML Tracking: `apps/web`が依存し、`main.tsx`で上の順に読み込みます。
- ドキュメントサイト（両製品の`pages/`）は`fonts.css`・`tokens.css`・`docs.css`を読み込みます。
- mado S3 Data Catalog: `front/`が依存し、mado ML Trackingと同じく上の順に読み込みます（layerは使いません）。

### 画面の枠のclassと属性

- `.login-mark.login-header`: ログインカードの上段で、ロゴと表示言語の選択を左右に並べます。ログイン画面と初回パスワード変更画面で同じ配置にします。
- `.app-shell[data-navigation]`: サイドバーの形。`sidebar`（名前とアイコン）、`rail`（アイコンだけ）、`drawer`（上部バーのメニューボタンから開く）のどれかをアプリが入れます。`sidebar`のときは`.brand`（アプリ名）がサイドバーと同じ幅になります。
- `.navigation-sidebar`と`.navigation-drawer`は、ライト・ダークのどちらのテーマでも上部バーと同じ暗い色（`--header`で始まる変数）で描きます。上部バーとナビゲーションをひと続きの枠にして、画面の中身と分けるためです。サイドバーの上端には、上部バーとの境目の線（`--header-border`）を引きます。選択中の項目と、フォーカスの印には`--header-indicator`を使います。
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
- 利用者が選び直した形式の保存は各アプリが持ちます（mado ML Trackingは`mmt.codeLanguage`、mado S3 Data Catalogは`mado.codeLanguage`）。保存はReactの`useCodeLanguage`が、アプリから渡された保存キーで行います。

## 共通の処理とReactの部品

`src/`のTypeScriptを`npm run build`（`npm pack`の前にも自動で実行）で`dist/`へ書き出して配ります。保存キーや表示の文言は各アプリのものなので、どれも引数で受け取ります。

| 読み込み先 | 中身 |
|---|---|
| `@mado/design-system/layout` | 切り替え幅（`BREAKPOINT_PX`・`narrowerThan`）、サイドバーの幅（`NAVIGATION_WIDTH`・`clampNavigationWidth`・`storedNavigationWidth`） |
| `@mado/design-system/popover` | ボタンの下に開くメニューの置き場所（`placeDropdown`） |
| `@mado/design-system/locale` | 表示言語（`createLocaleStore({ storageKey })`・`LANGUAGES`）。保存した言語 → ブラウザの優先言語 → 英語の順に決め、別のタブの変更も受け取ります |
| `@mado/design-system/theme` | ライト・ダーク（`initialTheme`・`saveTheme`・`readDocumentTheme`） |
| `@mado/design-system/format` | バイト数（`formatBytes`、1024で割ってKiB・MiB）、経過時間（`formatRelativeTime`）、名前の頭文字（`initialsOf`）。表示言語のIntlの言語（`ja-JP`など）を渡します |
| `@mado/design-system/datetime-input` | `<input type="datetime-local">`の値と日時の変換（`formatLocalDateTimeInput`・`parseLocalDateTimeInput`）。あり得ない日時を弾きます |
| `@mado/design-system/token-expiry` | アクセストークンの期限の選び方（7・30・90・365日、無期限、分・時間・日での入力、カレンダー。既定は90日） |
| `@mado/design-system/http` | APIの呼び出し（`requestJson(url, { schema, init, onUnauthorized })`）。応答の本文をzodのスキーマで確かめ、失敗はAPIの本文をそのまま持つ`ApiError`（`status`・`code`・`message`＝APIの文・`details`）にする。画面は`message`をそのまま出し、訳す層は持たない。JSONとして読まない呼び出し（Blob・流したまま読む・HEAD）は`fetchResponse`で、失敗だけ`ApiError`にする。`jsonRequestInit`・`cursorPageSchema`・`isNotFoundError`・`isUnauthorizedError`も。zod（4.4以上）を自分の依存に入れる |
| `@mado/design-system/list-navigation` | メニューや候補の一覧での矢印キー・Home・Endの移動先（`moveActiveIndex`） |
| `@mado/design-system/clipboard` | `copyText`。HTTPのLANでも、モーダルのダイアログの中でもコピーでき、失敗すると`false`を返します |
| `@mado/design-system/monaco` | `tokens.css`の色でMonacoのテーマを定義する`defineMonacoTheme(monaco.editor, theme)`と`monacoFontFamily` |
| `@mado/design-system/react` | `Dialog`、`LanguagePicker`、`LoginHeader`、`ProductLogo`、`UserMenu`、`NavigationSidebar`、`NavigationDrawer`、`NavigationResizeHandle`、`ErrorNotice`・`LoadingMessage`・`EmptyMessage`と、`useMediaQuery`・`useAnchoredPopover`・`usePopover`・`useTheme`・`useDocumentTheme`・`useLocale`・`useNavigationLayout`・`useModalDialog`・`useCodeLanguage`・`useQuery` |

Reactの部品を使うアプリは、`react`・`react-dom`（19.2以上）と`lucide-react`（0.577）を自分の依存に入れます。どれも省略できるpeer dependencyで、CSSだけを使うアプリには要りません。

- `Dialog`はブラウザの`<dialog>`をモーダルで開きます。開いている間だけ描きます（`{open && <Dialog … />}`）。最初の入力欄へフォーカスを移し（タッチ画面ではダイアログ自体）、閉じたら開いたボタンへ戻します。`dismissible={false}`の間はEscapeでも閉じません。背景のクリックで閉じるのは`closesOnBackdropClick`を付けたときだけです（入力の途中で誤って閉じないように）。
- `NavigationSidebar`のリンクは`renderLinks`でアプリが描きます。アイコンだけの列のときは`showsTitles`が`true`になるので、リンクに`title`を付けます。
- `LanguagePicker`には、アプリが`createLocaleStore`で作ったものを渡します。
- `ProductLogo`の印は製品ごとの`<svg className="product-mark">`をアプリが渡します。強調色の線に`product-mark-accent`、文字色の線に`product-mark-base`を付けます。線の太さはどの製品も1.75です。
- `UserMenu`の項目は、画面へ移るリンク（`href`）か、その場の操作（`onSelect`、サインアウトなど）です。リンクは既定で`<a>`で、react-routerを使うアプリは`renderLink`で`Link`を描きます。
- `useQuery`の`error`は投げられたものをそのまま返します。文言にするのはアプリです（APIのエラーの形がアプリごとに違うため）。

## 変数と部品を足す・変えるときの決まり

- 名前は見た目でなく役割で付けます（`--teal`ではなく`--accent`）。
- 色は`tokens.css`の変数にだけ値で書き、ほかのファイルは変数を使います。片方のアプリだけが使う色は、そのアプリが自分の変数の定義の場所（`:root`と`:root[data-theme='dark']`）に値で書きます。文字色は、置かれる面（`--background`〜`--selected`、tintの地）のすべてで4.5:1以上にします（WCAG AA）。フォーカスの印や入力欄の枠は3:1以上にします。
- ライトだけで足した色は、ダークでも見えるかを確かめ、必要なら`:root[data-theme='dark']`にも書きます。
- 行の高さはブラウザの既定（`line-height: normal`、`base.css`のbody）です。
- 文字の大きさは`--font-size-2xs`（10px）〜`--font-size-xl`（18px）の7段です。ロゴや大きな見出しのように1か所でしか使わない大きさだけ、値で書きます。
- 角丸は`--radius-none`（入力・ボタン・表）、`--radius-sm`（小さな部品・パネル）、`--radius-pill`（バッジ）の3段です。円は`50%`を使います。
- メディアクエリは640px・900px・1200pxの3つだけを、範囲の書き方（`@media (width < 900px)`）で書きます。
- 部品のclassを足すときは、片方のアプリだけで使うものは各アプリに置き、両方で使うものだけをここに置きます。

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
3. 各アプリの依存のURLを新しい版に替えて`npm install`します（mado S3 Data Catalog: `front/`と`pages/`、mado ML Tracking: `apps/web`）。

Releaseの作成に失敗したときは、直したcommitをmainへ入れるか、ActionsのRelease workflowを手で実行（Run workflow）し直します。

一度公開した版のtarballは差し替えません。差し替えると、各アプリのlockfileの`integrity`と合わなくなります。直すときは版を上げます。

## ライセンス

[Apache License 2.0](LICENSE)です。同梱のIBM Plexは[SIL Open Font License 1.1](fonts/OFL.txt)です。テキストの色付けが使う[highlight.js](https://highlightjs.org/)（BSD-3-Clause）は同梱せず、使うアプリが依存に入れます。
