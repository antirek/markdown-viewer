/**
 * Fullscreen Mermaid viewer with pan + zoom.
 */

const MIN_SCALE = 0.25;
const MAX_SCALE = 6;
const ZOOM_STEP = 1.2;

export function createMermaidLightbox(root = document.body) {
  const lightbox = document.createElement('div');
  lightbox.id = 'mermaid-lightbox';
  lightbox.className = 'mermaid-lightbox';
  lightbox.hidden = true;
  lightbox.innerHTML = `
    <div class="mermaid-lightbox-bar">
      <div class="mermaid-lightbox-tools" role="toolbar" aria-label="Масштаб диаграммы">
        <button type="button" class="btn" data-action="zoom-out" title="Уменьшить">−</button>
        <span class="mermaid-zoom-label" data-role="zoom-label">100%</span>
        <button type="button" class="btn" data-action="zoom-in" title="Увеличить">+</button>
        <button type="button" class="btn" data-action="reset" title="Сбросить">Сброс</button>
      </div>
      <div class="mermaid-lightbox-bar-end">
        <button type="button" class="btn btn-accent" data-action="close">Закрыть</button>
        <button type="button" class="dialog-close mermaid-lightbox-x" data-action="close" aria-label="Закрыть" title="Закрыть">×</button>
      </div>
    </div>
    <div class="mermaid-lightbox-stage" data-role="stage">
      <div class="mermaid-lightbox-canvas" data-role="canvas"></div>
      <p class="mermaid-lightbox-hint">Колёсико — zoom · перетаскивание — перемещение · Esc / клик вне схемы — закрыть</p>
    </div>
  `;
  root.appendChild(lightbox);

  const stage = lightbox.querySelector('[data-role="stage"]');
  const canvas = lightbox.querySelector('[data-role="canvas"]');
  const zoomLabel = lightbox.querySelector('[data-role="zoom-label"]');

  let scale = 1;
  let tx = 0;
  let ty = 0;
  let dragging = false;
  let didDrag = false;
  let lastX = 0;
  let lastY = 0;
  let activePointer = null;

  function applyTransform() {
    canvas.style.transform = `translate(-50%, -50%) translate(${tx}px, ${ty}px) scale(${scale})`;
    zoomLabel.textContent = `${Math.round(scale * 100)}%`;
  }

  function setScale(next, originX, originY) {
    const rect = stage.getBoundingClientRect();
    const ox = (originX ?? rect.left + rect.width / 2) - rect.left - rect.width / 2;
    const oy = (originY ?? rect.top + rect.height / 2) - rect.top - rect.height / 2;

    const prev = scale;
    scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, next));
    tx = ox - ((ox - tx) * scale) / prev;
    ty = oy - ((oy - ty) * scale) / prev;
    applyTransform();
  }

  function resetView() {
    const svg = canvas.querySelector('svg');
    if (svg) {
      const w = parseFloat(svg.getAttribute('width')) || svg.clientWidth || 800;
      const h = parseFloat(svg.getAttribute('height')) || svg.clientHeight || 600;
      fitToStage(w, h);
      return;
    }
    scale = 1;
    tx = 0;
    ty = 0;
    applyTransform();
  }

  function resolveSvgSize(svg) {
    const attrW = svg.getAttribute('width');
    const attrH = svg.getAttribute('height');
    const percentSized =
      (attrW && String(attrW).includes('%')) || (attrH && String(attrH).includes('%'));

    let w = attrW && !String(attrW).includes('%') ? parseFloat(attrW) : NaN;
    let h = attrH && !String(attrH).includes('%') ? parseFloat(attrH) : NaN;

    // Mermaid often sets width="100%"; prefer viewBox for true diagram size.
    if (percentSized && svg.viewBox?.baseVal?.width > 0 && svg.viewBox.baseVal.height > 0) {
      return {
        w: svg.viewBox.baseVal.width,
        h: svg.viewBox.baseVal.height,
      };
    }

    if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) {
      w = svg.clientWidth;
      h = svg.clientHeight;
    }

    if ((!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) && svg.viewBox?.baseVal) {
      const vb = svg.viewBox.baseVal;
      if (vb.width > 0 && vb.height > 0) {
        w = vb.width;
        h = vb.height;
      }
    }

    if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) {
      try {
        const box = svg.getBBox();
        w = box.width;
        h = box.height;
      } catch {
        w = 800;
        h = 600;
      }
    }

    return { w: Math.max(1, w), h: Math.max(1, h) };
  }

  function fitToStage(svgWidth, svgHeight) {
    const rect = stage.getBoundingClientRect();
    const padX = rect.width * 0.9;
    const padY = rect.height * 0.82;
    const fit = Math.min(padX / svgWidth, padY / svgHeight, 1);
    scale = Number.isFinite(fit) && fit > 0 ? fit : 1;
    tx = 0;
    ty = 0;
    applyTransform();
  }

  function close() {
    lightbox.hidden = true;
    document.documentElement.classList.remove('mermaid-lightbox-open');
    canvas.replaceChildren();
    dragging = false;
    activePointer = null;
  }

  function open(sourceContainer) {
    const svg = sourceContainer.querySelector('.mermaid svg, svg');
    if (!svg) {
      console.warn('Mermaid lightbox: SVG not found');
      return;
    }

    const { w, h } = resolveSvgSize(svg);
    const clone = svg.cloneNode(true);
    clone.setAttribute('width', String(w));
    clone.setAttribute('height', String(h));
    if (!clone.getAttribute('viewBox')) {
      clone.setAttribute('viewBox', `0 0 ${w} ${h}`);
    }
    clone.style.width = `${w}px`;
    clone.style.height = `${h}px`;
    clone.style.maxWidth = 'none';
    clone.style.maxHeight = 'none';
    clone.removeAttribute('aria-roledescription');

    canvas.replaceChildren(clone);
    lightbox.hidden = false;
    document.documentElement.classList.add('mermaid-lightbox-open');

    // Wait a frame so stage has real size, then fit diagram.
    requestAnimationFrame(() => {
      fitToStage(w, h);
    });
  }

  lightbox.addEventListener('click', (event) => {
    const action = event.target.closest('[data-action]')?.dataset.action;
    if (!action) return;
    if (action === 'close') close();
    if (action === 'zoom-in') setScale(scale * ZOOM_STEP);
    if (action === 'zoom-out') setScale(scale / ZOOM_STEP);
    if (action === 'reset') resetView();
  });

  stage.addEventListener(
    'wheel',
    (event) => {
      if (lightbox.hidden) return;
      event.preventDefault();
      const direction = event.deltaY < 0 ? ZOOM_STEP : 1 / ZOOM_STEP;
      setScale(scale * direction, event.clientX, event.clientY);
    },
    { passive: false },
  );

  stage.addEventListener('pointerdown', (event) => {
    if (event.button !== 0) return;
    // Pan only when grabbing the diagram itself.
    if (!event.target.closest('[data-role="canvas"]')) return;
    dragging = true;
    didDrag = false;
    activePointer = event.pointerId;
    lastX = event.clientX;
    lastY = event.clientY;
    stage.setPointerCapture(event.pointerId);
    stage.classList.add('is-dragging');
  });

  stage.addEventListener('pointermove', (event) => {
    if (!dragging || event.pointerId !== activePointer) return;
    const dx = event.clientX - lastX;
    const dy = event.clientY - lastY;
    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) didDrag = true;
    tx += dx;
    ty += dy;
    lastX = event.clientX;
    lastY = event.clientY;
    applyTransform();
  });

  function endDrag(event) {
    if (event.pointerId !== activePointer) return;
    dragging = false;
    activePointer = null;
    stage.classList.remove('is-dragging');
  }

  stage.addEventListener('pointerup', endDrag);
  stage.addEventListener('pointercancel', endDrag);

  stage.addEventListener('click', (event) => {
    if (didDrag) {
      didDrag = false;
      return;
    }
    // Click on dark area outside the SVG closes the lightbox.
    if (!event.target.closest('[data-role="canvas"]')) {
      close();
    }
  });

  window.addEventListener('keydown', (event) => {
    if (lightbox.hidden) return;
    if (event.key === 'Escape') close();
    if (event.key === '+' || event.key === '=') setScale(scale * ZOOM_STEP);
    if (event.key === '-') setScale(scale / ZOOM_STEP);
    if (event.key === '0') resetView();
  });

  return { open, close };
}

export function enhanceMermaidDiagrams(root, lightbox) {
  root.querySelectorAll('.mermaid-diagram').forEach((container) => {
    if (container.dataset.enhanced === '1') return;
    container.dataset.enhanced = '1';

    const toolbar = document.createElement('div');
    toolbar.className = 'mermaid-toolbar';

    const expandBtn = document.createElement('button');
    expandBtn.type = 'button';
    expandBtn.className = 'btn mermaid-expand';
    expandBtn.textContent = 'На весь экран';
    expandBtn.addEventListener('click', () => lightbox.open(container));
    toolbar.appendChild(expandBtn);
    container.appendChild(toolbar);

    container.addEventListener('dblclick', (event) => {
      if (event.target.closest('button')) return;
      lightbox.open(container);
    });
  });
}
