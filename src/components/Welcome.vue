<script setup>
defineProps({
  showInstall: { type: Boolean, default: false },
  installHelpText: { type: String, default: 'Как установить как приложение' },
});

defineEmits(['install', 'howto']);
</script>

<template>
  <section class="welcome">
    <p class="welcome-kicker">только чтение · локальные файлы</p>
    <h1>Markdown Viewer</h1>
    <p class="welcome-lead">
      Откройте <code>.md</code> или перетащите файл сюда. Без редактирования и без записи на диск.
    </p>
    <div class="welcome-cta">
      <label class="btn btn-accent btn-lg" for="file-input">Открыть файл</label>
      <button
        v-if="showInstall"
        type="button"
        class="btn btn-lg"
        @click="$emit('install')"
      >
        Установить приложение
      </button>
    </div>
    <p v-if="showInstall" class="welcome-hint">
      Сейчас это вкладка браузера.
      <button type="button" class="linkish" @click="$emit('howto')">
        {{ installHelpText }}
      </button>
    </p>
  </section>
</template>
