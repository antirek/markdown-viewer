import { mount, flushPromises } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
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
});
