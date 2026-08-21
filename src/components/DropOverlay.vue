<script setup>
defineProps({
  visible: { type: Boolean, default: false },
});
</script>

<template>
  <div class="drop-overlay" :hidden="!visible">
    <p>Отпустите, чтобы открыть</p>
  </div>
</template>
