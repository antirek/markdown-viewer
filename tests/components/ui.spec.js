import { flushPromises, mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import TopBar from '../../src/components/TopBar.vue';
import SourcePanel from '../../src/components/reader/SourcePanel.vue';
import HowtoDialog from '../../src/components/howto/HowtoDialog.vue';
import { nextTick } from 'vue';

describe('TopBar', () => {
  it('shows version and source button state', () => {
    const wrapper = mount(TopBar, {
      props: {
        version: '0.2.4',
        fileName: 'sample.md',
        showSourceBtn: true,
        sourceOpen: true,
        showInstall: true,
        showPrintBtn: true,
      },
    });
    expect(wrapper.text()).toContain('v0.2.4');
    expect(wrapper.text()).toContain('sample.md');
    expect(wrapper.text()).toContain('PDF');
    expect(wrapper.find('[aria-pressed="true"]').exists()).toBe(true);
  });

  it('emits print when PDF is clicked', async () => {
    const wrapper = mount(TopBar, {
      props: {
        version: '0.2.4',
        showPrintBtn: true,
      },
    });
    const pdfBtn = wrapper.findAll('button').find((b) => b.text() === 'PDF');
    expect(pdfBtn).toBeTruthy();
    await pdfBtn.trigger('click');
    expect(wrapper.emitted('print')).toBeTruthy();
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

  it('copies source to clipboard', async () => {
    const writeText = vi.fn().mockResolvedValue();
    vi.stubGlobal('navigator', { ...navigator, clipboard: { writeText } });
    const wrapper = mount(SourcePanel, {
      props: { open: true, source: '# hi' },
    });
    await wrapper.find('.source-copy').trigger('click');
    await flushPromises();
    expect(writeText).toHaveBeenCalledWith('# hi');
    expect(wrapper.find('.source-copy').text()).toBe('Скопировано');
    vi.unstubAllGlobals();
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
