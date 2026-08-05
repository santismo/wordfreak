const PIPER_MODULE_URLS = [
  "https://cdn.jsdelivr.net/npm/@mintplex-labs/piper-tts-web@1.0.4/+esm",
  "https://esm.sh/@mintplex-labs/piper-tts-web@1.0.4?bundle"
];
const PIPER_MAX_TEXT_CHARS = 320;

let piperModulePromise = null;
let session = null;
let sessionVoiceId = "";
let activeRequestId = 0;
let workQueue = Promise.resolve();

async function loadPiperModule() {
  if (piperModulePromise) return piperModulePromise;
  piperModulePromise = (async () => {
    let lastError = null;
    for (const url of PIPER_MODULE_URLS) {
      try {
        // A stalled import is cancelled by the owning page terminating this
        // worker. Only try the fallback after a real rejection so two module
        // graphs cannot download concurrently in one worker.
        return await import(url);
      } catch (error) {
        lastError = error;
      }
    }
    throw lastError || new Error("Piper module could not load");
  })();
  try {
    return await piperModulePromise;
  } catch (error) {
    piperModulePromise = null;
    throw error;
  }
}

function reportProgress(event) {
  if (!activeRequestId) return;
  self.postMessage({
    type: "progress",
    id: activeRequestId,
    url: String(event?.url || ""),
    loaded: Number(event?.loaded) || 0,
    total: Number(event?.total) || 0
  });
}

async function ensureSession(voiceId) {
  const module = await loadPiperModule();
  if (!module.PATH_MAP || !module.PATH_MAP[voiceId]) {
    throw new Error(`Piper voice is unavailable: ${voiceId}`);
  }
  if (session && sessionVoiceId !== voiceId) {
    throw new Error("Piper worker supports one active voice at a time");
  }
  if (!session) {
    sessionVoiceId = voiceId;
    session = new module.TtsSession({
      voiceId,
      progress: reportProgress
    });
    await session.waitReady;
  }
  return session;
}

async function synthesize(message) {
  const id = Number(message?.id) || 0;
  const voiceId = String(message?.voiceId || "");
  const text = String(message?.text || "").trim();
  if (!id || !voiceId || !text) throw new Error("Invalid Piper request");
  if (text.length > PIPER_MAX_TEXT_CHARS) throw new Error("Piper text is too long");

  activeRequestId = id;
  try {
    const activeSession = await ensureSession(voiceId);
    const blob = await activeSession.predict(text);
    if (!(blob instanceof Blob) || !blob.size) throw new Error("Piper returned no audio");
    self.postMessage({ type: "result", id, blob });
  } finally {
    activeRequestId = 0;
  }
}

async function clearDownloadedVoices(message) {
  const id = Number(message?.id) || 0;
  if (!id) throw new Error("Invalid Piper clear request");
  activeRequestId = id;
  try {
    const root = await navigator.storage.getDirectory();
    try {
      // piper-tts-web stores only its downloaded model/config files in this
      // named OPFS directory. Removing it directly works offline and avoids
      // loading the speech module merely to clear storage.
      await root.removeEntry("piper", { recursive: true });
    } catch (error) {
      if (error?.name !== "NotFoundError") throw error;
    }
    self.postMessage({ type: "cleared", id });
  } finally {
    activeRequestId = 0;
  }
}

self.addEventListener("message", (event) => {
  if (event.data?.type !== "synthesize" && event.data?.type !== "clear") return;
  const message = event.data;
  workQueue = workQueue.then(async () => {
    try {
      if (message.type === "clear") await clearDownloadedVoices(message);
      else await synthesize(message);
    } catch (error) {
      self.postMessage({
        type: "error",
        id: Number(message?.id) || 0,
        message: String(error?.message || "Piper synthesis failed")
      });
    }
  });
});
