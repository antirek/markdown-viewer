import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  handleMarkdownLinkClick,
  isExternalHttpUrl,
  openOutsideApp,
  shouldOpenOutsideApp,
} from '../../src/lib/externalLinks.js';

describe('isExternalHttpUrl / shouldOpenOutsideApp', () => {
  it('accepts absolute http(s) and protocol-relative URLs', () => {
    expect(isExternalHttpUrl('https://example.com/a')).toBe(true);
    expect(isExternalHttpUrl('http://example.com')).toBe(true);
    expect(isExternalHttpUrl('//cdn.example.com/x')).toBe(true);
    expect(shouldOpenOutsideApp('https://example.com')).toBe(true);
  });

  it('rejects anchors, relative paths, and empty', () => {
    expect(shouldOpenOutsideApp('#section')).toBe(false);
    expect(shouldOpenOutsideApp('./other.md')).toBe(false);
    expect(shouldOpenOutsideApp('/local')).toBe(false);
    expect(shouldOpenOutsideApp('')).toBe(false);
    expect(shouldOpenOutsideApp(null)).toBe(false);
  });
});

describe('openOutsideApp', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('opens via window.open with blank target', () => {
    const open = vi.fn(() => ({ closed: false }));
    vi.stubGlobal('open', open);
    expect(openOutsideApp('https://example.com/docs')).toBe(true);
    expect(open).toHaveBeenCalledWith(
      'https://example.com/docs',
      '_blank',
      'noopener,noreferrer',
    );
  });
});

describe('handleMarkdownLinkClick', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('prevents default and opens external links', () => {
    const open = vi.fn(() => ({ closed: false }));
    vi.stubGlobal('open', open);

    const root = document.createElement('article');
    const a = document.createElement('a');
    a.href = 'https://example.com/out';
    a.textContent = 'out';
    root.appendChild(a);
    document.body.appendChild(root);

    const event = new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 });
    Object.defineProperty(event, 'target', { value: a });
    Object.defineProperty(event, 'currentTarget', { value: root });
    const prevent = vi.spyOn(event, 'preventDefault');

    handleMarkdownLinkClick(event);

    expect(prevent).toHaveBeenCalled();
    expect(open).toHaveBeenCalled();
    root.remove();
  });

  it('ignores relative links', () => {
    const open = vi.fn();
    vi.stubGlobal('open', open);

    const root = document.createElement('article');
    const a = document.createElement('a');
    a.setAttribute('href', './other.md');
    root.appendChild(a);

    const event = new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 });
    Object.defineProperty(event, 'target', { value: a });
    Object.defineProperty(event, 'currentTarget', { value: root });
    const prevent = vi.spyOn(event, 'preventDefault');

    handleMarkdownLinkClick(event);

    expect(prevent).not.toHaveBeenCalled();
    expect(open).not.toHaveBeenCalled();
  });
});
