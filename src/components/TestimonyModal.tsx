"use client";

import { useEffect, useState } from "react";
import { formatDayDateLong, generateMissionPrompt, getMission } from "@/lib/schedule";
import { submitTestimony, useTestimonies } from "@/lib/dataService";
import { useSession } from "@/lib/useSession";
import { setDisplayName } from "@/lib/session";

interface TestimonyModalProps {
  day: number | null;
  onClose: () => void;
}

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export default function TestimonyModal({ day, onClose }: TestimonyModalProps) {
  const mission = day ? getMission(day) : undefined;
  const { testimonies, loading } = useTestimonies(day);
  const session = useSession();

  const [name, setName] = useState(session.displayName);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Keep `name` synced to the session's display name whenever it changes
  // externally (e.g. edited in the header while this modal is open), without
  // clobbering it on every render — adjusted during render, not in an effect.
  const [syncedDisplayName, setSyncedDisplayName] = useState(session.displayName);
  if (session.displayName !== syncedDisplayName) {
    setSyncedDisplayName(session.displayName);
    setName(session.displayName);
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!day || !mission) return null;

  const myTestimony = testimonies.find((t) => t.authorId === session.id);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !message.trim() || !day) return;
    setSubmitting(true);
    setError(null);
    try {
      await submitTestimony(day, session.id, name.trim(), message.trim());
      setDisplayName(name.trim());
      setMessage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-stone-900/40 p-0 backdrop-blur-sm animate-fade-in sm:items-center sm:p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="flex max-h-[88vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-[#fffaf0] shadow-2xl animate-modal-in sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`Day ${mission.day} testimonies`}
      >
        <div className="relative shrink-0 bg-gradient-to-br from-amber-200 via-orange-200 to-rose-200 px-6 pb-5 pt-6">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/70 text-stone-600 transition hover:bg-white"
          >
            ✕
          </button>
          <p className="text-xs font-bold uppercase tracking-wide text-amber-800">
            Day {mission.day} of 33 · {formatDayDateLong(mission.date)}
          </p>
          <h2 className="mt-1 text-xl font-bold leading-snug text-stone-800">{mission.title}</h2>
          <p className="text-sm text-stone-600">{mission.speaker}</p>
          <p className="mt-2 text-sm italic text-stone-700/90">{generateMissionPrompt(mission)}</p>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto px-6 py-4">
          {loading && <p className="text-sm text-stone-400">Loading testimonies…</p>}
          {!loading && testimonies.length === 0 && (
            <p className="text-sm italic text-stone-400">No testimonies yet — be the first to share today.</p>
          )}
          {testimonies.map((t) => (
            <div key={t.id} className="rounded-2xl bg-white/70 px-4 py-3 shadow-sm">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-sm font-semibold text-stone-800">{t.authorName}</span>
                <span className="text-[0.7rem] text-stone-400">{timeAgo(t.createdAt)}</span>
              </div>
              <p className="mt-0.5 text-sm leading-relaxed text-stone-600">{t.message}</p>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="shrink-0 space-y-2 border-t border-amber-200/70 bg-white/60 px-6 py-4">
          <p className="text-xs font-semibold text-stone-500">
            {myTestimony ? "Update your testimony for today" : "Share your testimony for today"}
          </p>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            maxLength={60}
            required
            className="w-full rounded-xl border border-amber-200 bg-white px-3 py-2 text-sm outline-none focus:border-amber-400"
          />
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={myTestimony?.message ?? "What did you learn or feel today?"}
            maxLength={320}
            rows={3}
            required
            className="w-full resize-none rounded-xl border border-amber-200 bg-white px-3 py-2 text-sm outline-none focus:border-amber-400"
          />
          <div className="flex items-center justify-between">
            <span className="text-[0.7rem] text-stone-400">{message.length}/320</span>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-full bg-amber-500 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-600 disabled:opacity-50"
            >
              {submitting ? "Sharing…" : myTestimony ? "Update" : "Share"}
            </button>
          </div>
          {error && <p className="text-xs text-rose-500">{error}</p>}
        </form>
      </div>
    </div>
  );
}
