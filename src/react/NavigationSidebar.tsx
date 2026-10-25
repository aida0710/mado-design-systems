import type { ReactNode } from 'react';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { NavigationResizeHandle } from './NavigationResizeHandle';
import type { NavigationLayout } from './useNavigationLayout';

export interface NavigationSidebarLabels {
  /** The accessible name of the <aside>, telling it apart from other sidebars on a page. */
  sidebar: string;
  expand: string;
  collapse: string;
  width: string;
}

/**
 * The navigation from md up: the full sidebar with names or, below lg or when the user collapses
 * it, a rail of icons. On wide screens the button at the bottom collapses or expands it and its
 * right edge changes the width. Narrower screens use NavigationDrawer instead.
 *
 * `renderLinks` draws the app's links; `showsTitles` is true on the rail, where the names are not
 * on screen and the links show them as tooltips. `header` (such as a project selector) shows only
 * in the full sidebar.
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
