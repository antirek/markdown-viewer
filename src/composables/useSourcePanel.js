import { ref } from 'vue';

export function useSourcePanel() {
  const isOpen = ref(false);

  function setOpen(value) {
    isOpen.value = Boolean(value);
    document.documentElement.classList.toggle('source-open', isOpen.value);
  }

  function toggle() {
    setOpen(!isOpen.value);
  }

  return { isOpen, setOpen, toggle };
}
