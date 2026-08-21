import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  detectBrowser,
  detectPlatform,
  getHowtoPayload,
  isChromiumBrowser,
  platformLabel,
  INSTRUCTIONS,
} from '../../src/lib/platform.js';

function mockNavigator({ ua = '', platform = '', uaDataPlatform } = {}) {
  vi.stubGlobal('navigator', {
    userAgent: ua,
    platform,
    userAgentData: uaDataPlatform ? { platform: uaDataPlatform } : undefined,
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('detectPlatform', () => {
  it('detects windows from userAgentData', () => {
    mockNavigator({ uaDataPlatform: 'Windows' });
    expect(detectPlatform()).toBe('windows');
  });

  it('detects macos from UA', () => {
    mockNavigator({ ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' });
    expect(detectPlatform()).toBe('macos');
  });

  it('defaults linux-like for Linux UA', () => {
    mockNavigator({ ua: 'X11; Linux x86_64', platform: 'Linux x86_64' });
    expect(detectPlatform()).toBe('linux');
  });
});

describe('detectBrowser / isChromiumBrowser', () => {
  it('detects chrome and edge as chromium', () => {
    mockNavigator({ ua: 'Mozilla/5.0 Chrome/120.0.0.0 Safari/537.36' });
    expect(detectBrowser()).toBe('chrome');
    expect(isChromiumBrowser()).toBe(true);

    mockNavigator({ ua: 'Mozilla/5.0 Edg/120.0.0.0 Chrome/120.0.0.0' });
    expect(detectBrowser()).toBe('edge');
    expect(isChromiumBrowser()).toBe(true);
  });

  it('detects firefox as non-chromium', () => {
    mockNavigator({ ua: 'Mozilla/5.0 Firefox/121.0' });
    expect(detectBrowser()).toBe('firefox');
    expect(isChromiumBrowser()).toBe(false);
  });
});

describe('getHowtoPayload', () => {
  beforeEach(() => {
    mockNavigator({ ua: 'X11; Linux x86_64 Chrome/120', platform: 'Linux' });
  });

  it('returns instructions for selected platform', () => {
    const payload = getHowtoPayload('windows');
    expect(payload.platform).toBe('windows');
    expect(payload.title).toBe(INSTRUCTIONS.windows.title);
    expect(payload.steps.length).toBeGreaterThan(0);
    expect(payload.detectedLabel).toContain(platformLabel('linux'));
  });
});
