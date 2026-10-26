# 変更履歴

## 0.7.1

- 行の高さをブラウザの既定（`line-height: normal`）として`base.css`で決めました。これまでmado S3 Data CatalogはTailwindの1.5、mado ML Trackingは既定で、両アプリで違っていました。
- `<p>`に付けた`.state-message`に、既定の上下の余白が付かないようにしました。
- `@mado/design-system/http`に、JSONとして読まない呼び出し用の`fetchResponse`と、`isUnauthorizedError`を足しました。`abort(理由)`で止めた呼び出しを通信の失敗として扱っていたのを直しました。
- mado S3 Data CatalogがTailwindを外したので、READMEとCSSのコメントのTailwindの記述を消しました。

## 0.7.0

- APIの呼び出しの`@mado/design-system/http`を足しました。応答の本文をzodのスキーマで確かめ、失敗はAPIの本文（`{ error, code, ...値 }`）をそのまま持つ`ApiError`にします。画面は`ApiError`の`message`（APIの文）をそのまま出します。両アプリがそれぞれ持っていた取得とエラーの扱いを、これにまとめます。zodは省略できるpeer dependencyで、使うアプリが入れます。

## 0.6.3

- `.menu-item`の行の高さが、後に書いた`font: inherit`で既定に戻り、0.6.2で直したつもりの表示言語のメニューの行の高さがそろっていなかったのを直しました。同じ書き方を見つけるテストを足しました。

## 0.6.2

mado ML Trackingへの取り込みで見つかった不具合と、両アプリが同じ指定を書いていた部分を直しました。

- 640px未満のダイアログで、閉じるボタンがダイアログの外へはみ出して横にスクロールしていたのを直しました。
- 900px未満の`.touch-targets`で、チェックボックスのラベルを1行に1つずつ並べるようにしました（`.checkbox-field`やポップオーバーの選択肢が横に並んでいました）。
- `.menu-item`の行の高さをそろえ、押せない危険な操作が赤いまま残らないようにしました。
- `.popover.anchored-popover`が`.popover`の`top: 100%`を打ち消すようにしました。使う側で`top`・`bottom`を書き直す必要はありません。
- 一覧の上の帯の選択欄（`.toolbar-item > select`）、検索欄の中のボタン、640px未満の並べ方を足しました。両アプリが同じ指定を書いていたものです。
- `.touch-targets`の表とパンくずのリンクが、flexの中で行を高くしないようにしました。
- `UserMenu`の項目に`key`を付けました。`useQuery`は`key`が`null`のとき、最初の描画から読み込み中にしません。`useCodeLanguage`の`fileName`は`null`も受け付けます。
- `@mado/design-system/locale`に`intlLocaleOf`を足しました。
- `docs.css`の文字の大きさを変数にしました。

## 0.6.1

- `dist/`の相対importに拡張子`.js`を付けました。0.6.0はバンドラーでは読めても、NodeのESM（アプリのVitestなど）では読めませんでした。
- `.popover`に文字色を持たせました。上部バーの中に開くユーザーメニューが、ライトテーマで白地に白の文字になっていました。
- `.dialog`に`margin: auto`を持たせました。Tailwindのpreflightのように既定のmarginを消す環境でも中央に出ます。
- `UserMenu`の項目に、画面へ移るリンク（`href`）に加えて、その場の操作（`onSelect`、サインアウトなど）を置けるようにしました。
- `.menu-item`に、狭い画面のタップ領域（`--tap-target`）を持たせました。
- `ErrorNotice`に補足（`detail`）を添えられるようにしました。
- `formatRelativeTime`の日本語で、数字と単位の間の空白を入れないようにしました（「5分前」）。

## 0.6.0

読み込む側の変更が要る版です。

- 状態バッジのclassを、アプリの状態の名前から役割の名前に替えました。`.status-finished`→`.status-success`、`.status-running`・`.status-claimed`→`.status-info`、`.status-failed`→`.status-danger`、`.status-queued`・`.status-canceled`→`.status-neutral`です。`.status-attention`はそのまま残し、強調色の印（既定の項目・最新の版）の`.status-accent`を足しました。どれも`.status-badge`と一緒に付けます。
- mado ML Trackingだけが使う変数を消しました。`--chart-positive`・`--chart-negative`・`--chart-missing`・`--media-label-background`・`--media-label-text`・`--status-stopped-text`・`--status-stopped-background`・`--header-alert`・`--on-accent-hover`・`--shadow-drag`です。使うアプリが自分で定義します。
- 文字の大きさの変数（`--font-size-2xs`〜`--font-size-xl`の7段）を足し、このパッケージのCSSもそれで書きました。
- 部品を足しました。注意の通知（`.notice.warning`）、メニュー（`.popover.menu`・`.menu-item`・`.menu-separator`）、`useAnchoredPopover`で置くポップオーバー（`.popover.anchored-popover`）、一覧の上の帯（`.toolbar`・`.toolbar-search`・`.toolbar-item`）、パンくずの入れ物（`.breadcrumbs`）、ダイアログの見出しの補足（`.dialog-heading`）と幅`.dialog.extra-wide`、表示言語のボタン（`.language-picker`）、rechartsの軸の色です。
- 狭い画面の`.touch-targets`で、表と`.eyebrow`の中のリンク、ボタンの形でない`summary`のタップ領域を広げます。
- 両アプリにあった同じ処理とReactの部品を移しました（`@mado/design-system/layout`・`popover`・`locale`・`theme`・`format`・`clipboard`・`monaco`・`react`）。保存キーと表示の文言は引数で受け取ります。Reactの部品を使うアプリは`react`・`react-dom`・`lucide-react`を自分の依存に入れます。
- ユーザーメニュー（`UserMenu`、`.user-menu`）、製品のロゴ（`ProductLogo`、`.product-logo`・`.product-mark-base`・`.product-mark-accent`。線の太さは1.75）、読み込み中・失敗・空の表示、データの読み込み（`useQuery`）、アクセストークンの期限の選び方、`datetime-local`の値の変換を足しました。
- 来歴のグラフの`lineage.css`と、ドキュメントサイトのテーマの`docs.css`を足しました。
- `src/`のTypeScriptを`npm pack`の前に`dist/`へ書き出すようにしました。
- コードのコメントを日本語にしました。

## 0.5.2

- ログインカードの上段に、ロゴと表示言語の選択を並べる`.login-header`を追加しました。320px幅でも言語ボタンが次の行へ折り返さない配置です。

## 0.5.1

- サイドバーの上端に、上部バーとの境目の線（`--header-border`）を引きました。0.5.0でサイドバーと上部バーが同じ色になり、境目が見えなくなっていたためです。ドロワーの見出しの下の線と同じ色です。

## 0.5.0

- サイドバー（`.navigation-sidebar`）を、ライトテーマでも上部バーと同じ暗い色にしました。スマホのドロワー（`.navigation-drawer`）は前から暗い色で、サイドバーとドロワーの項目の色の指定を1つにまとめました。選択中の項目の線とアイコン、幅を変える境目、フォーカスの印は`--header-indicator`です。
- 読み込む側の変更は要りません。サイドバーの中に自前の色を指定している場合は、暗い地で読めるか確かめてください。

## 0.4.0

- 名前を`@mado/design-tokens`から`@mado/design-system`に変え、Mado Model Trackingの`packages/design-tokens`からこのリポジトリへ移しました。CSSと`code.js`の中身は0.3.0と同じです。読み込む側は`@mado/design-tokens/…`を`@mado/design-system/…`に書き換えます。
- GitHub Releaseに添付したtarballで配ります（npmのregistryには出しません）。
- CSSの決まり（色の値・変数・メディアクエリ・ダークテーマ）、文字色のコントラスト、形式の推測と色付けを、このリポジトリのテストとGitHub Actionsで確かめます。
- `package.json`の`exports`に`./package.json`を足しました。

## 0.3.0 以前（`@mado/design-tokens`、Mado Model Trackingの`packages/design-tokens`）

- 0.3.0: テキストのプレビューの形式の推測と色付け（`code.js`・`code.d.ts`・`code.css`、highlight.js）と、コード用の色の変数。
- 0.2.0: 要素の既定（`base.css`）、共通の部品（`components.css`）、画面の枠（`shell.css`）。
- 0.1.0: ライト・ダークの色、書体、角丸の変数（`tokens.css`）とIBM Plex（`fonts.css`）。
