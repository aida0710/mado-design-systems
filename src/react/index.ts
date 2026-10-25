/*
 * React hooks and components shared by the apps. Every text is passed in by the app in its display
 * language, since each app keeps its own translation catalog.
 */
export { Dialog, type DialogNarrowLayout, type DialogProps, type DialogSize } from './Dialog';
export { LanguagePicker } from './LanguagePicker';
export { LoginHeader } from './LoginHeader';
export { NavigationDrawer, type NavigationDrawerLabels } from './NavigationDrawer';
export { NavigationResizeHandle } from './NavigationResizeHandle';
export { NavigationSidebar, type NavigationSidebarLabels } from './NavigationSidebar';
export { useAnchoredPopover } from './useAnchoredPopover';
export {
  codeLanguageKey,
  useCodeLanguage,
  type CodeLanguageChoice,
  type CodeLanguageState,
} from './useCodeLanguage';
export { useLocale } from './useLocale';
export { useMediaQuery } from './useMediaQuery';
export { useModalDialog } from './useModalDialog';
export { useNavigationLayout, type NavigationLayout, type NavigationMode } from './useNavigationLayout';
export { useDocumentTheme, useTheme } from './useTheme';
