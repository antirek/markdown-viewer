<script setup>
defineProps({
  open: { type: Boolean, default: false },
  source: { type: String, default: '' },
});

defineEmits(['close']);
</script>

<template>
  <aside class="source-panel" :hidden="!open">
    <div class="source-panel-head">
      <span>Исходный Markdown</span>
      <button type="button" class="btn btn-ghost source-close" @click="$emit('close')">
        Скрыть
      </button>
    </div>
    <pre class="source-view" tabindex="0">{{ source }}</pre>
  </aside>
</template>
