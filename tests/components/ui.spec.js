import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import TopBar from '../../src/components/TopBar.vue';
import SourcePanel from '../../src/components/reader/SourcePanel.vue';
import HowtoDialog from '../../src/components/howto/HowtoDialog.vue';
import { nextTick } from 'vue';

describe('TopBar', () => {
  it('shows version and source button state', () => {
    const wrapper = mount(TopBar, {
      props: {
        version: '0.2.2',
        fileName: 'sample.md',
        showSourceBtn: true,
        sourceOpen: true,
        showInstall: true,
      },
    });
    expect(wrapper.text()).toContain('v0.2.2');
    expect(wrapper.text()).toContain('sample.md');
    expect(wrapper.find('[aria-pressed="true"]').exists()).toBe(true);
  });
});

describe('SourcePanel', () => {
  it('renders source and emits close', async () => {
    const wrapper = mount(SourcePanel, {
      props: { open: true, source: '# hi' },
    });
    expect(wrapper.find('.source-view').text()).toBe('# hi');
    await wrapper.find('.source-close').trigger('click');
    expect(wrapper.emitted('close')).toBeTruthy();
  });
});

describe('HowtoDialog', () => {
  it('opens and switches platform tabs', async () => {
    const wrapper = mount(HowtoDialog, {
      props: {
        open: true,
        platforms: ['windows', 'macos', 'linux'],
        selectedPlatform: 'linux',
        payload: {
          detectedLabel: 'Сейчас: Linux · Chrome',
          title: 'Установка на Linux',
          steps: ['Шаг один'],
          tip: 'Подсказка',
          code: 'echo ok',
        },
      },
      attachTo: document.body,
    });
    await nextTick();
    expect(wrapper.text()).toContain('Установка на Linux');
    await wrapper.findAll('.platform-tab')[0].trigger('click');
    expect(wrapper.emitted('select-platform')[0]).toEqual(['windows']);
    wrapper.unmount();
  });
});
