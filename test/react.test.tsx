// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, renderHook, screen } from '@testing-library/react';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { createLocaleStore } from '../src/locale';
import { Dialog } from '../src/react/Dialog';
import { LanguagePicker } from '../src/react/LanguagePicker';
import { useCodeLanguage } from '../src/react/useCodeLanguage';
import { useNavigationLayout } from '../src/react/useNavigationLayout';

// jsdomにはモーダルダイアログが無いので、ブラウザの開く・閉じるの代わりにこれを使う。
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    this.removeAttribute('open');
  };
});
beforeEach(() => localStorage.clear());
afterEach(cleanup);

describe('Dialog', () => {
  it('Escape で閉じ、処理中は閉じない', () => {
    const onClose = vi.fn();
    const { rerender } = render(
      <Dialog title="削除" onClose={onClose} closeLabel="閉じる">
        <p>本文</p>
      </Dialog>,
    );
    const dialog = screen.getByRole('dialog');
    fireEvent(dialog, new Event('cancel', { cancelable: true }));
    expect(onClose).toHaveBeenCalledTimes(1);
    rerender(
      <Dialog title="削除" onClose={onClose} closeLabel="閉じる" dismissible={false}>
        <p>本文</p>
      </Dialog>,
    );
    fireEvent(dialog, new Event('cancel', { cancelable: true }));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: '閉じる' })).toHaveProperty('disabled', true);
  });

  it('見出しで名前が付き、補足と下のボタンを出す', () => {
    render(
      <Dialog title="名前の変更" subtitle="s3://bucket/key" footer={<button>保存</button>} onClose={() => {}} closeLabel="閉じる">
        <div className="dialog-body" />
      </Dialog>,
    );
    expect(screen.getByRole('dialog', { name: '名前の変更' })).toBeTruthy();
    expect(screen.getByText('s3://bucket/key')).toBeTruthy();
    expect(screen.getByRole('button', { name: '保存' }).closest('footer')).toBeTruthy();
  });
});

describe('createLocaleStore', () => {
  it('保存した言語を優先し、アプリごとの保存キーに書く', () => {
    localStorage.setItem('app-a.locale', 'ja');
    const store = createLocaleStore({ storageKey: 'app-a.locale' });
    expect(store.getLocale()).toBe('ja');
    expect(store.getIntlLocale()).toBe('ja-JP');
    store.setLocale('en');
    expect(localStorage.getItem('app-a.locale')).toBe('en');
    expect(localStorage.getItem('app-b.locale')).toBeNull();
  });

  it('LanguagePicker で選ぶと言語が替わる', () => {
    const store = createLocaleStore({ storageKey: 'picker.locale' });
    store.setLocale('en');
    render(<LanguagePicker store={store} label="Language" />);
    fireEvent.click(screen.getByRole('button', { name: 'Language: English' }));
    fireEvent.click(// jsdomにはPopover APIが無いので、メニューはポップオーバーの隠れた状態から出ない。
    screen.getByRole('menuitemradio', { name: '日本語', hidden: true }));
    expect(store.getLocale()).toBe('ja');
  });
});

describe('useNavigationLayout', () => {
  it('畳んだ状態と幅を接頭辞つきのキーに保存する', () => {
    const { result } = renderHook(() => useNavigationLayout({ storageKeyPrefix: 'app.navigation' }));
    expect(result.current.mode).toBe('sidebar');
    act(() => result.current.setWidth(500));
    act(() => result.current.toggleCollapsed());
    expect(localStorage.getItem('app.navigation.width')).toBe('360');
    expect(localStorage.getItem('app.navigation.collapsed')).toBe('true');
    expect(result.current.mode).toBe('rail');
  });
});

describe('useCodeLanguage', () => {
  it('選んだ形式を拡張子ごとに渡された保存キーへ覚える', () => {
    const { result, rerender } = renderHook(
      ({ fileName }) => useCodeLanguage({ storageKey: 'app.codeLanguage', fileName, text: '' }),
      { initialProps: { fileName: 'a.conf' } },
    );
    act(() => result.current.setChoice('yaml'));
    expect(JSON.parse(localStorage.getItem('app.codeLanguage') ?? '{}')).toEqual({ conf: 'yaml' });
    rerender({ fileName: 'b.conf' });
    expect(result.current.language).toBe('yaml');
  });
});
