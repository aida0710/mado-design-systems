import { useEffect, useState } from 'react';
import { clampNavigationWidth, narrowerThan, NAVIGATION_WIDTH, storedNavigationWidth } from '../layout';
import { readStorage, writeStorage } from '../storage';
import { useMediaQuery } from './useMediaQuery';

// Below md the screen is too narrow even for the rail of icons, so a drawer holds the navigation;
// below lg the full sidebar would squeeze the content, so only the rail shows.
const DRAWER_QUERY = narrowerThan('md');
const RAIL_QUERY = narrowerThan('lg');

/** sidebar: names and icons; rail: icons only; drawer: behind the menu button in the top bar. */
export type NavigationMode = 'sidebar' | 'rail' | 'drawer';

export interface NavigationLayout {
  mode: NavigationMode;
  /** Wide screens let the user switch between the full sidebar and the rail. */
  canCollapse: boolean;
  toggleCollapsed: () => void;
  width: number;
  setWidth: (width: number) => void;
  resetWidth: () => void;
}

/**
 * How the navigation shows at the current screen width, with the width and collapsed state the
 * user chose for the full sidebar, saved as `<storageKeyPrefix>.collapsed` and `.width`.
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
