import type { Role } from "./types";

/**
 * Demo-mode "auth". In production this is replaced entirely by Supabase Auth
 * (magic link / email) plus the `profiles.role` column — see ARCHITECTURE.md
 * and DEPLOYMENT.md. This shim exists purely so the prototype is interactive
 * without any backend configured: a random member id is minted on first
 * visit and persisted to localStorage, and role can be toggled from the UI
 * to preview the admin dashboard.
 */

const STORAGE_KEY = "tol_session_v1";

export interface Session {
  id: string;
  displayName: string;
  role: Role;
}

function randomId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `member-${Math.random().toString(36).slice(2)}`;
}

function defaultSession(): Session {
  return { id: randomId(), displayName: "", role: "member" };
}

/** Stable reference for server rendering, where localStorage doesn't exist
 *  yet — required so `useSyncExternalStore`'s server snapshot never changes
 *  reference between calls within the same render pass. */
const SERVER_SESSION: Session = { id: "server", displayName: "", role: "member" };

type Listener = () => void;
const listeners = new Set<Listener>();
let storeVersion = 0;
function notify() {
  storeVersion += 1;
  listeners.forEach((cb) => cb());
}
export function subscribeSession(cb: Listener): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

let sessionCache: { version: number; value: Session } | null = null;

export function getSession(): Session {
  if (typeof window === "undefined") return SERVER_SESSION;
  if (sessionCache && sessionCache.version === storeVersion) return sessionCache.value;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  let value: Session;
  if (!raw) {
    value = defaultSession();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } else {
    try {
      value = JSON.parse(raw) as Session;
    } catch {
      value = defaultSession();
    }
  }
  sessionCache = { version: storeVersion, value };
  return value;
}

function save(session: Session) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  notify();
}

export function setDisplayName(name: string) {
  save({ ...getSession(), displayName: name });
}

/** Demo-only role switch, so you can preview /admin. Real deployments must
 *  gate this via the `profiles.role` column enforced by RLS, never a client toggle. */
export function setDemoRole(role: Role) {
  save({ ...getSession(), role });
}
