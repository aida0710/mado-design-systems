# 変更履歴

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
