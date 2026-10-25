import {
  Fragment,
  useEffect,
  useId,
  useRef,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  type Ref,
} from 'react';
import { initialsOf } from '../format.js';
import { isListNavigationKey, moveActiveIndex } from '../listNavigation.js';
import { usePopover } from './usePopover.js';

interface UserMenuItemBase {
  /** 繰り返しのkeyと、読み上げの名前。 */
  label: string;
  /** 前の項目との間に区切りの線を引く（全体設定など、まとまりが替わる項目）。 */
  startsGroup?: boolean;
}

/** 画面へ移る項目。 */
export interface UserMenuLinkItem extends UserMenuItemBase {
  href: string;
}

/** その場で操作する項目（サインアウトなど）。選ぶとメニューを閉じてから呼ぶ。 */
export interface UserMenuActionItem extends UserMenuItemBase {
  onSelect: () => void;
  disabled?: boolean;
}

export type UserMenuItem = UserMenuLinkItem | UserMenuActionItem;

/** 項目のリンクの描き方。react-routerのLinkなどを使うアプリが渡す。既定は<a>。 */
export type UserMenuLinkRenderer = (
  item: UserMenuLinkItem,
  props: { ref: Ref<HTMLAnchorElement>; role: 'menuitem'; tabIndex: -1; className: string; children: ReactNode },
) => ReactNode;

const renderAnchor: UserMenuLinkRenderer = (item, { children, ...props }) => (
  <a {...props} href={item.href}>
    {children}
  </a>
);

/**
 * 上部バーの頭文字の丸と、そこから開くメニュー（利用者の名前・メール・アカウントの画面など）。
 * キーボードではメニューボタンとして動く。Enter・Space・↓ で最初の項目（↑ で最後）を選んで開き、
 * ↑↓ Home Endで項目を移り、Escapeで丸へ戻り、Tabで閉じて次へ進む。
 */
export function UserMenu({
  displayName,
  email,
  label,
  items,
  renderLink = renderAnchor,
  closeKey,
}: {
  displayName: string;
  email?: string | null;
  /** メニューの名前（例: 「ユーザーメニュー」）。表示言語で渡す。 */
  label: string;
  items: readonly UserMenuItem[];
  renderLink?: UserMenuLinkRenderer;
  /** 変わるとメニューを閉じる値。画面の移動で閉じるならpathname。 */
  closeKey?: unknown;
}) {
  const menuId = useId();
  const { container, isOpen, open, close, toggle } = usePopover({ closeKey });
  const itemRefs = useRef<(HTMLElement | null)[]>([]);
  // キーボードで開いたとき、メニューを描いた後にフォーカスする項目。
  const itemToFocusOnOpen = useRef<number | null>(null);

  useEffect(() => {
    if (!isOpen || itemToFocusOnOpen.current === null) return;
    itemRefs.current[itemToFocusOnOpen.current]?.focus();
    itemToFocusOnOpen.current = null;
  }, [isOpen]);

  // 開いていれば（クリックで開いて丸にフォーカスが残っている）すぐ移し、閉じていれば描いてから移す。
  const focusItem = (index: number) => {
    if (isOpen) {
      itemRefs.current[index]?.focus();
      return;
    }
    itemToFocusOnOpen.current = index;
    open();
  };
  const handleAvatarClick = (event: MouseEvent<HTMLButtonElement>) => {
    // Enter・Spaceで押したクリックはdetailが0。
    if (event.detail === 0 && !isOpen) focusItem(0);
    else toggle();
  };
  const handleAvatarKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    event.preventDefault();
    focusItem(event.key === 'ArrowDown' ? 0 : items.length - 1);
  };
  const handleMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!isListNavigationKey(event.key)) return;
    event.preventDefault();
    const current = itemRefs.current.findIndex((item) => item === document.activeElement);
    itemRefs.current[moveActiveIndex({ current, key: event.key, count: items.length })]?.focus();
  };
  const closeWhenFocusLeaves = (event: FocusEvent<HTMLDivElement>) => {
    const next = event.relatedTarget as Node | null;
    if (isOpen && next && !event.currentTarget.contains(next)) close();
  };

  return (
    <div className="user-menu" ref={container} onBlur={closeWhenFocusLeaves}>
      <button
        type="button"
        className="avatar"
        title={displayName}
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={menuId}
        onClick={handleAvatarClick}
        onKeyDown={handleAvatarKeyDown}
      >
        {initialsOf(displayName)}
      </button>
      {isOpen && (
        <div className="popover menu user-menu-popover" id={menuId} role="menu" aria-label={label} onKeyDown={handleMenuKeyDown}>
          <div className="user-menu-identity">
            <strong>{displayName}</strong>
            {email && <span className="muted">{email}</span>}
          </div>
          {items.map((item, index) => {
            const className = item.startsGroup ? 'menu-item starts-group' : 'menu-item';
            const ref = (element: HTMLElement | null) => {
              itemRefs.current[index] = element;
            };
            if ('href' in item) {
              return (
                <Fragment key={item.label}>
                  {renderLink(item, { ref, role: 'menuitem', tabIndex: -1, className, children: item.label })}
                </Fragment>
              );
            }
            return (
              <button
                key={item.label}
                ref={ref}
                type="button"
                role="menuitem"
                tabIndex={-1}
                className={className}
                disabled={item.disabled}
                onClick={() => {
                  close();
                  item.onSelect();
                }}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
