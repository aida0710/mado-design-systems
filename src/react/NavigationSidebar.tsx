import type { ReactNode } from 'react';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { NavigationResizeHandle } from './NavigationResizeHandle';
import type { NavigationLayout } from './useNavigationLayout';

export interface NavigationSidebarLabels {
  /** <aside>の読み上げの名前。ページのほかのサイドバーと区別する。 */
  sidebar: string;
  expand: string;
  collapse: string;
  width: string;
}

/**
 * md以上のナビゲーション。名前の付いた通常のサイドバーか、lg未満または利用者が折りたたんだときは
 * アイコンのレール。広い画面では、下端のボタンで折りたたみ・展開ができ、右端で幅を変えられる。
 * それより狭い画面では、代わりにNavigationDrawerを使う。
 *
 * `renderLinks`はアプリのリンクを描く。`showsTitles`はレールのときtrueで、名前が画面に出ないので
 * リンクがツールチップで名前を出す。`header`（プロジェクトの選択欄など）は通常のサイドバーでだけ
 * 出す。
 */
export function NavigationSidebar({
  layout,
  labels,
  renderLinks,
  header,
}: {
  layout: NavigationLayout;
  labels: NavigationSidebarLabels;
  renderLinks: (options: { showsTitles: boolean }) => ReactNode;
  header?: ReactNode;
}) {
  const isRail = layout.mode === 'rail';
  const toggleLabel = isRail ? labels.expand : labels.collapse;
  return (
    <aside className="navigation-sidebar" data-collapsed={isRail ? 'true' : 'false'} aria-label={labels.sidebar}>
      <div className="navigation-sidebar-scroll">
        {!isRail && header}
        {renderLinks({ showsTitles: isRail })}
      </div>
      {layout.canCollapse && (
        <div className="navigation-sidebar-footer">
          <button
            type="button"
            className="icon-button"
            aria-label={toggleLabel}
            aria-expanded={!isRail}
            title={toggleLabel}
            onClick={layout.toggleCollapsed}
          >
            {isRail ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </button>
        </div>
      )}
      {layout.canCollapse && !isRail && (
        <NavigationResizeHandle
          width={layout.width}
          onResize={layout.setWidth}
          onReset={layout.resetWidth}
          label={labels.width}
        />
      )}
    </aside>
  );
}
