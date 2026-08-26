import { mount, flushPromises } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';

vi.mock('../../src/lib/mermaidLightbox.js', () => ({
  createMermaidLightbox: () => ({ open: vi.fn() }),
}));

vi.mock('../../src/lib/launchFiles.js', () => ({
  onLaunchedFiles: vi.fn(),
  readLaunchedHandle: vi.fn(),
  wireLaunchQueue: vi.fn(),
}));

import App from '../../src/App.vue';

describe('App', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    document.documentElement.classList.remove('is-reading', 'source-open');
  });

  it('opens a markdown file into reader', async () => {
    const wrapper = mount(App, { attachTo: document.body });
    await nextTick();

    const file = new File(['# Hello Vue'], 'hello.md', { type: 'text/markdown' });
    await wrapper.findComponent({ name: 'TopBar' }).vm.$emit('file-selected', file);
    await flushPromises();
    await nextTick();

    expect(wrapper.text()).toContain('hello.md');
    expect(document.documentElement.classList.contains('is-reading')).toBe(true);
    expect(wrapper.find('.markdown-body').html()).toContain('<h1');
    wrapper.unmount();
  });

  it('calls window.print when TopBar emits print', async () => {
    const print = vi.fn();
    vi.stubGlobal('print', print);
    vi.stubGlobal('requestAnimationFrame', (cb) => {
      cb();
      return 0;
    });

    const wrapper = mount(App, { attachTo: document.body });
    await nextTick();

    const file = new File(['# Print me'], 'print.md', { type: 'text/markdown' });
    await wrapper.findComponent({ name: 'TopBar' }).vm.$emit('file-selected', file);
    await flushPromises();
    await nextTick();

    await wrapper.findComponent({ name: 'TopBar' }).vm.$emit('print');
    await flushPromises();

    expect(print).toHaveBeenCalledTimes(1);
    wrapper.unmount();
  });
});
