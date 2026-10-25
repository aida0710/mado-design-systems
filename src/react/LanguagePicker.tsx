import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { Check, Globe } from 'lucide-react';
import { LANGUAGES, type LocaleStore } from '../locale';
import { useAnchoredPopover } from './useAnchoredPopover';
import { useLocale } from './useLocale';

// The width of the shared popovers; the height fits the two language buttons.
const LANGUAGE_MENU_MIN_WIDTH = 220;
const LANGUAGE_MENU_MAX_HEIGHT = 160;

/** The display language menu, in the top bar and on the screens before signing in. */
export function LanguagePicker({ store, label }: { store: LocaleStore; label: string }) {
  const { locale, setLocale } = useLocale(store);
  const [isOpen, setIsOpen] = useState(false);
  const container = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const popoverStyle = useAnchoredPopover({
    isOpen,
    anchorRef: trigger,
    popoverRef: menu,
    minWidth: LANGUAGE_MENU_MIN_WIDTH,
    maxHeight: LANGUAGE_MENU_MAX_HEIGHT,
    alignment: 'end',
  });
  const selectedName = LANGUAGES.find((language) => language.locale === locale)?.name ?? locale;

  const closeAndFocus = () => {
    setIsOpen(false);
    trigger.current?.focus();
  };
  useEffect(() => {
    if (!isOpen) return;
    menu.current?.querySelector<HTMLButtonElement>('[aria-checked="true"]')?.focus();
    const closeOutside = (event: PointerEvent) => {
      if (!container.current?.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener('pointerdown', closeOutside);
    return () => document.removeEventListener('pointerdown', closeOutside);
  }, [isOpen]);

  const navigateMenu = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeAndFocus();
      return;
    }
    if (event.key === 'Tab') {
      setIsOpen(false);
      return;
    }
    const buttons = [...(menu.current?.querySelectorAll<HTMLButtonElement>('button') ?? [])];
    const current = buttons.indexOf(document.activeElement as HTMLButtonElement);
    const next =
      event.key === 'ArrowDown'
        ? (current + 1) % buttons.length
        : event.key === 'ArrowUp'
          ? (current + buttons.length - 1) % buttons.length
          : event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? buttons.length - 1
              : null;
    if (next === null) return;
    event.preventDefault();
    buttons[next]?.focus();
  };

  return (
    <div ref={container} className="language-picker">
      <button
        ref={trigger}
        type="button"
        className="icon-button"
        aria-label={`${label}: ${selectedName}`}
        title={`${label}: ${selectedName}`}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={isOpen ? menuId : undefined}
        onClick={() => setIsOpen((open) => !open)}
        onKeyDown={(event) => {
          if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
          event.preventDefault();
          setIsOpen(true);
        }}
      >
        <Globe size={17} aria-hidden="true" />
      </button>
      {isOpen && (
        <div
          ref={menu}
          id={menuId}
          className="popover menu anchored-popover"
          popover="manual"
          role="menu"
          aria-label={label}
          onKeyDown={navigateMenu}
          style={{ ...popoverStyle, top: popoverStyle?.top ?? 'auto', bottom: popoverStyle?.bottom ?? 'auto' }}
        >
          {LANGUAGES.map((language) => (
            <button
              key={language.locale}
              type="button"
              className="menu-item"
              role="menuitemradio"
              aria-checked={locale === language.locale}
              lang={language.locale}
              onClick={() => {
                setLocale(language.locale);
                closeAndFocus();
              }}
            >
              {locale === language.locale && <Check size={15} aria-hidden="true" />}
              {language.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
