import { nextTick } from 'vue';

let mermaidReady = null;

async function ensureMermaid() {
  if (!mermaidReady) {
    mermaidReady = import('mermaid').then(({ default: mermaid }) => {
      mermaid.initialize({
        startOnLoad: false,
        theme: 'neutral',
        securityLevel: 'strict',
        fontFamily: 'Source Sans 3, sans-serif',
      });
      return mermaid;
    });
  }
  return mermaidReady;
}

export function useMermaid({ onExpand } = {}) {
  async function renderIn(root) {
    if (!root) return;
    await nextTick();

    const codeBlocks = [...root.querySelectorAll('pre > code.language-mermaid')];
    if (!codeBlocks.length) return;

    const mermaid = await ensureMermaid();
    const nodes = [];

    for (const code of codeBlocks) {
      const pre = code.parentElement;
      if (!pre) continue;
      const container = document.createElement('div');
      container.className = 'mermaid-diagram';
      const diagram = document.createElement('div');
      diagram.className = 'mermaid';
      diagram.textContent = code.textContent ?? '';
      container.appendChild(diagram);
      pre.replaceWith(container);
      nodes.push(diagram);
    }

    try {
      await mermaid.run({ nodes });
    } catch (error) {
      console.error('Mermaid render failed', error);
    }

    root.querySelectorAll('.mermaid-diagram').forEach((container) => {
      if (container.dataset.enhanced === '1') return;
      container.dataset.enhanced = '1';

      const toolbar = document.createElement('div');
      toolbar.className = 'mermaid-toolbar';
      const expandBtn = document.createElement('button');
      expandBtn.type = 'button';
      expandBtn.className = 'btn mermaid-expand';
      expandBtn.textContent = 'На весь экран';
      expandBtn.addEventListener('click', () => onExpand?.(container));
      toolbar.appendChild(expandBtn);
      container.appendChild(toolbar);

      container.addEventListener('dblclick', (event) => {
        if (event.target.closest('button')) return;
        onExpand?.(container);
      });
    });
  }

  return { renderIn };
}
