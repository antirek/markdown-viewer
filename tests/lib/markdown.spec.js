import { describe, expect, it } from 'vitest';
import { createMarkdownIt, renderMarkdown } from '../../src/lib/markdown.js';

describe('createMarkdownIt', () => {
  it('returns a markdown-it instance that can render', () => {
    const md = createMarkdownIt();
    expect(md.render('# Hi')).toContain('<h1');
  });
});

describe('renderMarkdown', () => {
  it('returns source and sanitized html', () => {
    const { source, html } = renderMarkdown('# Title\n\nHello **world**');
    expect(source).toBe('# Title\n\nHello **world**');
    expect(html).toContain('<h1');
    expect(html).toContain('<strong>world</strong>');
  });

  it('treats null/undefined as empty source', () => {
    expect(renderMarkdown(null)).toEqual({ source: '', html: '' });
    expect(renderMarkdown(undefined)).toEqual({ source: '', html: '' });
  });

  it('adds target and rel to absolute http(s) links', () => {
    const { html } = renderMarkdown('[Go](https://example.com/path)');
    expect(html).toContain('href="https://example.com/path"');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
  });

  it('does not force target on relative links', () => {
    const { html } = renderMarkdown('[Local](./other.md)');
    expect(html).toContain('href="./other.md"');
    expect(html).not.toContain('target="_blank"');
  });

  it('strips dangerous script tags via DOMPurify', () => {
    const { html } = renderMarkdown('<script>alert(1)</script>\n\nSafe');
    expect(html.toLowerCase()).not.toContain('<script');
    expect(html).toContain('Safe');
  });
});
