import MarkdownIt from 'markdown-it';
import DOMPurify from 'dompurify';

export function createMarkdownIt() {
  return new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
    breaks: false,
  });
}

const md = createMarkdownIt();

export function renderMarkdown(text) {
  const source = text ?? '';
  const dirty = md.render(source);
  const html = DOMPurify.sanitize(dirty, {
    USE_PROFILES: { html: true },
    ADD_ATTR: ['target', 'rel'],
  });

  const wrapped = `<div>${html}</div>`;
  const doc = new DOMParser().parseFromString(wrapped, 'text/html');
  doc.querySelectorAll('a[href^="http"]').forEach((a) => {
    a.setAttribute('target', '_blank');
    a.setAttribute('rel', 'noopener noreferrer');
  });

  return {
    source,
    html: doc.body.firstElementChild?.innerHTML ?? html,
  };
}
