import { describe, expect, it } from 'vitest';
import { isAcceptableMarkdownFile, isMarkdownName } from '../../src/lib/fileTypes.js';

describe('isMarkdownName', () => {
  it('accepts common markdown extensions (case-insensitive)', () => {
    expect(isMarkdownName('readme.md')).toBe(true);
    expect(isMarkdownName('NOTES.MD')).toBe(true);
    expect(isMarkdownName('doc.markdown')).toBe(true);
    expect(isMarkdownName('x.mdown')).toBe(true);
    expect(isMarkdownName('y.mkd')).toBe(true);
    expect(isMarkdownName('z.mdx')).toBe(true);
  });

  it('rejects non-markdown names and empty values', () => {
    expect(isMarkdownName('readme.txt')).toBe(false);
    expect(isMarkdownName('image.png')).toBe(false);
    expect(isMarkdownName('md')).toBe(false);
    expect(isMarkdownName('')).toBe(false);
    expect(isMarkdownName(null)).toBe(false);
    expect(isMarkdownName(undefined)).toBe(false);
  });
});

describe('isAcceptableMarkdownFile', () => {
  it('returns false for null/undefined', () => {
    expect(isAcceptableMarkdownFile(null)).toBe(false);
    expect(isAcceptableMarkdownFile(undefined)).toBe(false);
  });

  it('accepts by filename extension', () => {
    expect(isAcceptableMarkdownFile({ name: 'a.md', type: '' })).toBe(true);
    expect(isAcceptableMarkdownFile({ name: 'b.markdown', type: 'application/octet-stream' })).toBe(
      true,
    );
  });

  it('accepts by MIME type when extension is unknown', () => {
    expect(isAcceptableMarkdownFile({ name: 'notes', type: 'text/markdown' })).toBe(true);
    expect(isAcceptableMarkdownFile({ name: 'notes', type: 'text/x-markdown' })).toBe(true);
    expect(isAcceptableMarkdownFile({ name: 'notes', type: 'text/plain' })).toBe(true);
  });

  it('rejects unrelated types without markdown names', () => {
    expect(isAcceptableMarkdownFile({ name: 'photo.jpg', type: 'image/jpeg' })).toBe(false);
    expect(isAcceptableMarkdownFile({ name: 'data.json', type: 'application/json' })).toBe(false);
  });
});
