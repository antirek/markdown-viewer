<script setup>
import { nextTick, ref, watch } from 'vue';

const props = defineProps({
  open: { type: Boolean, default: false },
  payload: {
    type: Object,
    default: () => ({
      detectedLabel: '',
      title: '',
      steps: [],
      tip: '',
      code: '',
    }),
  },
  platforms: { type: Array, default: () => ['windows', 'macos', 'linux'] },
  selectedPlatform: { type: String, default: 'linux' },
});

const emit = defineEmits(['update:open', 'select-platform']);
const dialogEl = ref(null);

const labels = { windows: 'Windows', macos: 'macOS', linux: 'Linux' };

watch(
  () => props.open,
  async (open) => {
    await nextTick();
    const el = dialogEl.value;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  },
  { immediate: true },
);

function close() {
  emit('update:open', false);
}

function onDialogClick(event) {
  if (event.target === dialogEl.value) close();
}

function onCloseEvent() {
  emit('update:open', false);
}
</script>

<template>
  <dialog ref="dialogEl" class="dialog" @click="onDialogClick" @close="onCloseEvent">
    <div class="dialog-panel">
      <button type="button" class="dialog-close" aria-label="Закрыть" title="Закрыть" @click="close">
        ×
      </button>
      <form method="dialog" class="dialog-inner" @submit.prevent="close">
        <p class="howto-detected">{{ payload.detectedLabel }}</p>
        <div class="platform-tabs" role="tablist" aria-label="Платформа">
          <button
            v-for="id in platforms"
            :key="id"
            type="button"
            class="platform-tab"
            role="tab"
            :class="{ 'is-active': selectedPlatform === id }"
            :aria-selected="selectedPlatform === id ? 'true' : 'false'"
            @click.prevent="$emit('select-platform', id)"
          >
            {{ labels[id] || id }}
          </button>
        </div>
        <h2>{{ payload.title }}</h2>
        <ol>
          <li v-for="(step, index) in payload.steps" :key="index" v-html="step"></li>
        </ol>
        <p v-if="payload.tip" class="howto-tip" v-html="payload.tip"></p>
        <pre v-if="payload.code">{{ payload.code }}</pre>
        <button type="submit" class="btn btn-accent">Понятно</button>
      </form>
    </div>
  </dialog>
</template>
