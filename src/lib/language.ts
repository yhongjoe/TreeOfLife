export type Language = "en" | "ko";

/**
 * Bilingual UI preference, localStorage-backed with a pub/sub emitter —
 * mirrors the pattern in session.ts. Defaults to Korean, since this app is
 * built for a Korean-speaking stake; falls back to the browser's language
 * on first visit if it isn't Korean.
 */

const STORAGE_KEY = "tol_language_v1";
const DEFAULT_LANGUAGE: Language = "ko";

type Listener = () => void;
const listeners = new Set<Listener>();
let storeVersion = 0;
function notify() {
  storeVersion += 1;
  listeners.forEach((cb) => cb());
}
export function subscribeLanguage(cb: Listener): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

let languageCache: { version: number; value: Language } | null = null;

export function getLanguage(): Language {
  if (typeof window === "undefined") return DEFAULT_LANGUAGE;
  if (languageCache && languageCache.version === storeVersion) return languageCache.value;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  const value: Language = raw === "en" || raw === "ko" ? raw : DEFAULT_LANGUAGE;
  languageCache = { version: storeVersion, value };
  return value;
}

export function setLanguage(lang: Language) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, lang);
  notify();
}
