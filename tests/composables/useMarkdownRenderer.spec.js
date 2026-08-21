import { describe, expect, it } from 'vitest';
import { useMarkdownRenderer } from '../../src/composables/useMarkdownRenderer.js';

describe('useMarkdownRenderer', () => {
  it('stores sanitized html and source', () => {
    const { html, source, render, clear } = useMarkdownRenderer();
    render('# Hello\n\n[x](https://example.com)');
    expect(source.value).toContain('# Hello');
    expect(html.value).toContain('<h1');
    expect(html.value).toContain('target="_blank"');

    clear();
    expect(html.value).toBe('');
    expect(source.value).toBe('');
  });
});
