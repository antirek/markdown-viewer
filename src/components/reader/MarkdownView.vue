<script setup>
import { ref } from 'vue';
import { handleMarkdownLinkClick } from '../../lib/externalLinks.js';

defineProps({
  html: { type: String, default: '' },
});

const root = ref(null);
defineExpose({ root });
</script>

<template>
  <article
    ref="root"
    class="markdown-body"
    v-html="html"
    @click.capture="handleMarkdownLinkClick"
  ></article>
</template>
