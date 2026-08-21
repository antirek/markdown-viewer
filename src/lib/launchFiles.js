/**
 * OS → PWA file open via File Handling API (launchQueue).
 * Must register the consumer as early as possible.
 */

let handler = null;
const pending = [];

export function onLaunchedFiles(fn) {
  handler = fn;
  if (pending.length) {
    const batch = pending.splice(0, pending.length);
    for (const files of batch) {
      void Promise.resolve(handler(files)).catch((error) => {
        console.error('Launch file handler failed', error);
      });
    }
  }
}

async function ensureReadPermission(handle) {
  if (!handle || typeof handle.queryPermission !== 'function') return true;

  const options = { mode: 'read' };
  let state = await handle.queryPermission(options);
  if (state === 'granted') return true;

  if (typeof handle.requestPermission === 'function') {
    state = await handle.requestPermission(options);
  }
  return state === 'granted';
}

export async function readLaunchedHandle(handle) {
  const allowed = await ensureReadPermission(handle);
  if (!allowed) {
    throw new Error('permission-denied');
  }
  return handle.getFile();
}

function deliver(files) {
  if (!files?.length) {
    console.warn('[launchQueue] launch without files', files);
    return;
  }
  if (handler) {
    void Promise.resolve(handler(files)).catch((error) => {
      console.error('Launch file handler failed', error);
    });
    return;
  }
  pending.push(files);
}

export function wireLaunchQueue() {
  if (!('launchQueue' in window)) {
    console.info('[launchQueue] File Handling API unavailable');
    return false;
  }

  window.launchQueue.setConsumer((launchParams) => {
    console.info('[launchQueue] consumer', {
      files: launchParams.files?.length ?? 0,
      targetURL: launchParams.targetURL,
    });
    deliver(launchParams.files || []);
  });

  return true;
}

// Register immediately on import.
wireLaunchQueue();
