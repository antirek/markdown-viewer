<script setup>
import { onUnmounted, ref } from 'vue';

const props = defineProps({
  open: { type: Boolean, default: false },
  source: { type: String, default: '' },
});

defineEmits(['close']);

const copyState = ref('idle');
let resetTimer = null;

async function writeClipboard(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  try {
    if (!document.execCommand('copy')) throw new Error('execCommand copy failed');
  } finally {
    textarea.remove();
  }
}

async function onCopy() {
  try {
    await writeClipboard(props.source);
    copyState.value = 'copied';
  } catch {
    copyState.value = 'error';
  }
  clearTimeout(resetTimer);
  resetTimer = setTimeout(() => {
    copyState.value = 'idle';
  }, 1500);
}

onUnmounted(() => clearTimeout(resetTimer));
</script>

<template>
  <aside class="source-panel" :hidden="!open">
    <div class="source-panel-head">
      <span>Исходный Markdown</span>
      <div class="source-panel-actions">
        <button
          type="button"
          class="btn btn-ghost source-copy"
          :disabled="!source"
          aria-live="polite"
          @click="onCopy"
        >
          {{ copyState === 'copied' ? 'Скопировано' : copyState === 'error' ? 'Ошибка' : 'Копировать' }}
        </button>
        <button type="button" class="btn btn-ghost source-close" @click="$emit('close')">
          Скрыть
        </button>
      </div>
    </div>
    <pre class="source-view" tabindex="0">{{ source }}</pre>
  </aside>
</template>
