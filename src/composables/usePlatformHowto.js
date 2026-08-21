import { computed, ref } from 'vue';
import {
  detectBrowser,
  detectPlatform,
  getHowtoPayload,
  isChromiumBrowser,
  platformLabel,
  PLATFORMS,
} from '../lib/platform.js';

export function usePlatformHowto() {
  const detectedPlatform = detectPlatform();
  const selectedPlatform = ref(detectedPlatform);
  const dialogOpen = ref(false);

  const payload = computed(() => getHowtoPayload(selectedPlatform.value));
  const chromium = isChromiumBrowser();

  function selectPlatform(id) {
    if (PLATFORMS.includes(id)) selectedPlatform.value = id;
  }

  function open(platform = detectedPlatform) {
    selectPlatform(platform);
    dialogOpen.value = true;
  }

  function close() {
    dialogOpen.value = false;
  }

  return {
    platforms: PLATFORMS,
    detectedPlatform,
    selectedPlatform,
    dialogOpen,
    payload,
    chromium,
    platformLabel,
    browserName: detectBrowser(),
    selectPlatform,
    open,
    close,
  };
}
