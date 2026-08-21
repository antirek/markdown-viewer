<script setup>
import { ref } from 'vue';

defineProps({
  version: { type: String, required: true },
  fileName: { type: String, default: 'файл не выбран' },
  showSourceBtn: { type: Boolean, default: false },
  sourceOpen: { type: Boolean, default: false },
  showInstall: { type: Boolean, default: false },
});

const emit = defineEmits(['file-selected', 'toggle-source', 'install', 'howto']);
const fileInput = ref(null);

function onFileChange(event) {
  const file = event.target.files?.[0];
  if (file) emit('file-selected', file);
  event.target.value = '';
}
</script>

<template>
  <header class="topbar">
    <div class="brand">
      <span class="brand-mark" aria-hidden="true">MD</span>
      <div class="brand-text">
        <strong>Markdown Viewer <span class="app-version">v{{ version }}</span></strong>
        <span class="file-name">{{ fileName }}</span>
      </div>
    </div>
    <div class="actions">
      <button
        v-if="showSourceBtn"
        type="button"
        class="btn"
        :aria-pressed="sourceOpen ? 'true' : 'false'"
        :class="{ 'is-active': sourceOpen }"
        @click="emit('toggle-source')"
      >
        Исходник
      </button>
      <label class="btn btn-accent" for="file-input">Открыть .md</label>
      <button v-if="showInstall" type="button" class="btn" @click="emit('install')">Установить</button>
      <button type="button" class="btn btn-ghost" @click="emit('howto')">Как установить</button>
    </div>
    <input
      id="file-input"
      ref="fileInput"
      class="file-input"
      type="file"
      accept=".md,.markdown,.mdown,.mkd,text/markdown"
      @change="onFileChange"
    />
  </header>
</template>
