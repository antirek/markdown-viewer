import { onMounted, onUnmounted, ref } from 'vue';
import { isAcceptableMarkdownFile } from '../lib/fileTypes.js';

export function useFileOpen({ onOpenText } = {}) {
  const isDragging = ref(false);
  let dragDepth = 0;

  async function openFile(file) {
    if (!file) return false;
    if (!isAcceptableMarkdownFile(file)) {
      alert('Откройте файл с расширением .md / .markdown');
      return false;
    }
    const text = await file.text();
    await onOpenText?.(text, file.name);
    return true;
  }

  function hasFiles(event) {
    return Array.from(event.dataTransfer?.types || []).includes('Files');
  }

  function onDragEnter(event) {
    if (!hasFiles(event)) return;
    event.preventDefault();
    dragDepth += 1;
    isDragging.value = true;
  }

  function onDragLeave(event) {
    if (!hasFiles(event)) return;
    event.preventDefault();
    dragDepth = Math.max(0, dragDepth - 1);
    if (dragDepth === 0) isDragging.value = false;
  }

  function onDragOver(event) {
    if (!hasFiles(event)) return;
    event.preventDefault();
  }

  async function onDrop(event) {
    if (!hasFiles(event)) return;
    event.preventDefault();
    dragDepth = 0;
    isDragging.value = false;
    const file = event.dataTransfer.files?.[0];
    await openFile(file);
  }

  onMounted(() => {
    window.addEventListener('dragenter', onDragEnter);
    window.addEventListener('dragleave', onDragLeave);
    window.addEventListener('dragover', onDragOver);
    window.addEventListener('drop', onDrop);
  });

  onUnmounted(() => {
    window.removeEventListener('dragenter', onDragEnter);
    window.removeEventListener('dragleave', onDragLeave);
    window.removeEventListener('dragover', onDragOver);
    window.removeEventListener('drop', onDrop);
  });

  return { isDragging, openFile };
}
