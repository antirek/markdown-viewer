import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('launchFiles', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubGlobal('launchQueue', {
      setConsumer: vi.fn((cb) => {
        globalThis.__launchConsumer = cb;
      }),
    });
  });

  it('flushes pending launches when handler registers', async () => {
    const { onLaunchedFiles } = await import('../../src/lib/launchFiles.js');
    const handle = { name: 'a.md' };
    globalThis.__launchConsumer({ files: [handle] });

    const received = [];
    onLaunchedFiles(async (files) => {
      received.push(...files);
    });

    await Promise.resolve();
    expect(received).toEqual([handle]);
  });

  it('readLaunchedHandle throws permission-denied', async () => {
    const { readLaunchedHandle } = await import('../../src/lib/launchFiles.js');
    const handle = {
      queryPermission: vi.fn(async () => 'denied'),
      requestPermission: vi.fn(async () => 'denied'),
      getFile: vi.fn(),
    };
    await expect(readLaunchedHandle(handle)).rejects.toThrow('permission-denied');
    expect(handle.getFile).not.toHaveBeenCalled();
  });

  it('readLaunchedHandle returns file when granted', async () => {
    const { readLaunchedHandle } = await import('../../src/lib/launchFiles.js');
    const file = { name: 'a.md' };
    const handle = {
      queryPermission: vi.fn(async () => 'granted'),
      getFile: vi.fn(async () => file),
    };
    await expect(readLaunchedHandle(handle)).resolves.toBe(file);
  });
});
