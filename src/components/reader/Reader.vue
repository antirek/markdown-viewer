<script setup>
import { ref } from 'vue';
import SourcePanel from './SourcePanel.vue';
import MarkdownView from './MarkdownView.vue';

defineProps({
  sourceOpen: { type: Boolean, default: false },
  source: { type: String, default: '' },
  html: { type: String, default: '' },
});

defineEmits(['close-source']);

const markdownView = ref(null);

function getMarkdownEl() {
  return markdownView.value?.root ?? null;
}

defineExpose({ getMarkdownEl });
</script>

<template>
  <div class="reader">
    <SourcePanel :open="sourceOpen" :source="source" @close="$emit('close-source')" />
    <MarkdownView ref="markdownView" :html="html" />
  </div>
</template>
