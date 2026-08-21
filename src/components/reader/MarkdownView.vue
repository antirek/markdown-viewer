<script setup>
import { ref } from 'vue';

defineProps({
  html: { type: String, default: '' },
});

const root = ref(null);
defineExpose({ root });
</script>

<template>
  <article ref="root" class="markdown-body" v-html="html"></article>
</template>
