# 変更履歴

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
