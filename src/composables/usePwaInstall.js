import { onMounted, onUnmounted, ref } from 'vue';

export function usePwaInstall({ onNeedHowto } = {}) {
  const deferredPrompt = ref(null);
  const isInstalled = ref(false);

  function checkInstalled() {
    isInstalled.value =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.matchMedia('(display-mode: minimal-ui)').matches ||
      window.matchMedia('(display-mode: window-controls-overlay)').matches;
    document.documentElement.classList.toggle('is-installed-app', isInstalled.value);
  }

  function onBeforeInstall(event) {
    event.preventDefault();
    deferredPrompt.value = event;
  }

  function onInstalled() {
    deferredPrompt.value = null;
    checkInstalled();
  }

  async function promptInstall() {
    if (deferredPrompt.value) {
      deferredPrompt.value.prompt();
      await deferredPrompt.value.userChoice;
      deferredPrompt.value = null;
      return 'prompted';
    }
    onNeedHowto?.();
    return 'howto';
  }

  let media;
  onMounted(() => {
    checkInstalled();
    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);
    media = window.matchMedia('(display-mode: standalone)');
    media.addEventListener?.('change', checkInstalled);
  });

  onUnmounted(() => {
    window.removeEventListener('beforeinstallprompt', onBeforeInstall);
    window.removeEventListener('appinstalled', onInstalled);
    media?.removeEventListener?.('change', checkInstalled);
  });

  return {
    deferredPrompt,
    isInstalled,
    canInstall: deferredPrompt,
    promptInstall,
    checkInstalled,
  };
}
