import { ref } from 'vue';
import { renderMarkdown } from '../lib/markdown.js';

export function useMarkdownRenderer() {
  const html = ref('');
  const source = ref('');

  function render(text) {
    const result = renderMarkdown(text);
    html.value = result.html;
    source.value = result.source;
    return result;
  }

  function clear() {
    html.value = '';
    source.value = '';
  }

  return { html, source, render, clear };
}
