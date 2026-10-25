import type { ReactNode } from 'react';

/**
 * 製品のロゴ。印と製品名を並べる。名前はIBMの製品名と同じく、前の「mado」を通常の太さ、製品の
 * 部分（「S3 Data Catalog」など）を太字にする。上部バー・ドロワー・ログイン画面で同じ組み方にする。
 * `mark`は製品ごとの印の<svg className="product-mark">。強調色の線にproduct-mark-accent、文字色の
 * 線にproduct-mark-baseを付ける。`compact`では名前を読み上げ用だけに残して印だけを見せる。
 */
export function ProductLogo({
  mark,
  name,
  prefix = 'mado',
  compact = false,
}: {
  mark: ReactNode;
  name: string;
  prefix?: string;
  compact?: boolean;
}) {
  return (
    <span className="product-logo">
      {mark}
      <span className={compact ? 'product-name sr-only' : 'product-name'}>
        <span className="product-prefix">{prefix}</span> <strong>{name}</strong>
      </span>
    </span>
  );
}
