/**
 * Open document links outside the PWA (system browser / new Chrome window).
 */

export function isExternalHttpUrl(href) {
  if (!href || typeof href !== 'string') return false;
  const value = href.trim();
  return /^https?:\/\//i.test(value) || /^\/\//.test(value);
}

export function resolveHref(href) {
  if (!href) return null;
  try {
    return new URL(href, typeof window !== 'undefined' ? window.location.href : 'https://example.invalid/').href;
  } catch {
    return null;
  }
}

/** Absolute http(s) URLs that should leave the app / PWA. */
export function shouldOpenOutsideApp(href) {
  if (!href || href.startsWith('#')) return false;
  return isExternalHttpUrl(href);
}

export function openOutsideApp(href) {
  const absolute = resolveHref(href);
  if (!absolute) return false;
  const opened = window.open(absolute, '_blank', 'noopener,noreferrer');
  // Some embedded WebViews ignore window.open — fall back to location assign in a synthetic tab via <a>.
  if (!opened) {
    const a = document.createElement('a');
    a.href = absolute;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
  return true;
}

export function handleMarkdownLinkClick(event) {
  if (event.defaultPrevented) return;
  if (event.button !== 0) return;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

  const anchor = event.target?.closest?.('a[href]');
  if (!anchor || !event.currentTarget?.contains?.(anchor)) return;

  const href = anchor.getAttribute('href');
  if (!shouldOpenOutsideApp(href)) return;

  event.preventDefault();
  event.stopPropagation();
  openOutsideApp(href);
}
