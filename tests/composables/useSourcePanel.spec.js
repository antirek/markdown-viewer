import { describe, expect, it } from 'vitest';
import { useSourcePanel } from '../../src/composables/useSourcePanel.js';

describe('useSourcePanel', () => {
  it('toggles and sets open state', () => {
    document.documentElement.classList.remove('source-open');
    const { isOpen, setOpen, toggle } = useSourcePanel();
    expect(isOpen.value).toBe(false);

    setOpen(true);
    expect(isOpen.value).toBe(true);
    expect(document.documentElement.classList.contains('source-open')).toBe(true);

    toggle();
    expect(isOpen.value).toBe(false);
    expect(document.documentElement.classList.contains('source-open')).toBe(false);
  });
});
