import { useEffect, useState } from 'react';
import { clampNavigationWidth, narrowerThan, NAVIGATION_WIDTH, storedNavigationWidth } from '../layout.js';
import { readStorage, writeStorage } from '../storage.js';
import { useMediaQuery } from './useMediaQuery.js';

// md未満ではアイコンのレールでも狭すぎるので、ドロワーにナビゲーションを収める。
// lg未満では通常のサイドバーが中身を圧迫するので、レールだけを出す。
const DRAWER_QUERY = narrowerThan('md');
const RAIL_QUERY = narrowerThan('lg');

/** sidebar: 名前とアイコン。rail: アイコンだけ。drawer: 上部バーのメニューボタンの奥。 */
export type NavigationMode = 'sidebar' | 'rail' | 'drawer';

export interface NavigationLayout {
  mode: NavigationMode;
  /** 広い画面では、利用者が通常のサイドバーとレールを切り替えられる。 */
  canCollapse: boolean;
  toggleCollapsed: () => void;
  width: number;
  setWidth: (width: number) => void;
  resetWidth: () => void;
}

/**
 * 今の画面幅でのナビゲーションの出し方と、利用者が通常のサイドバーに選んだ幅と折りたたみの状態。
 * 選んだ状態は`<storageKeyPrefix>.collapsed`と`.width`に保存する。
 */
export function useNavigationLayout({ storageKeyPrefix }: { storageKeyPrefix: string }): NavigationLayout {
  const collapsedKey = `${storageKeyPrefix}.collapsed`;
  const widthKey = `${storageKeyPrefix}.width`;
  const usesDrawer = useMediaQuery(DRAWER_QUERY);
  const fitsOnlyRail = useMediaQuery(RAIL_QUERY);
  const [collapsed, setCollapsed] = useState(() => readStorage(collapsedKey) === 'true');
  const [width, setStoredWidth] = useState(() => storedNavigationWidth(readStorage(widthKey)));
  useEffect(() => writeStorage(collapsedKey, String(collapsed)), [collapsedKey, collapsed]);
  useEffect(() => writeStorage(widthKey, String(width)), [widthKey, width]);
  const mode: NavigationMode = usesDrawer ? 'drawer' : fitsOnlyRail || collapsed ? 'rail' : 'sidebar';
  return {
    mode,
    canCollapse: !usesDrawer && !fitsOnlyRail,
    toggleCollapsed: () => setCollapsed((current) => !current),
    width,
    setWidth: (next) => setStoredWidth(clampNavigationWidth(next)),
    resetWidth: () => setStoredWidth(NAVIGATION_WIDTH.default),
  };
}
