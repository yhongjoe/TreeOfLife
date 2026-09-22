// Builds one personal testimony report per participant (dry run — sends nothing).
//
//   node --env-file=.env.admin scripts/build-reports.mjs [outDir]
//
// Reads testimonies + member emails from Supabase with the service_role key
// (RLS bypass, so keep .env.admin out of git — `.env*` is already ignored),
// and writes reports.json (recipient, subject, html per person) to outDir.
// Nothing here sends email; delivery is a separate, explicitly-approved step.

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { SCHEDULE, TOTAL_DAYS, formatDayDateLong } from "../src/lib/schedule.ts";

const url = process.env.SUPABASE_URL?.replace(/\/$/, "");
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY missing — run with --env-file=.env.admin");
  process.exit(1);
}
const outDir = process.argv[2] ?? "./reports-out";
const headers = { apikey: key, Authorization: `Bearer ${key}` };

async function getJson(path) {
  const res = await fetch(`${url}${path}`, { headers });
  if (!res.ok) throw new Error(`${path.split("?")[0]} -> ${res.status} ${await res.text()}`);
  return res.json();
}

async function fetchAllTestimonies() {
  const rows = [];
  for (let from = 0; ; from += 1000) {
    const res = await fetch(
      `${url}/rest/v1/testimonies?select=user_id,day,author_name,message,created_at&order=day.asc`,
      { headers: { ...headers, Range: `${from}-${from + 999}` } },
    );
    if (!res.ok) throw new Error(`testimonies -> ${res.status} ${await res.text()}`);
    const page = await res.json();
    rows.push(...page);
    if (page.length < 1000) return rows;
  }
}

async function fetchAllUsers() {
  const users = [];
  for (let page = 1; ; page++) {
    const { users: batch } = await getJson(`/auth/v1/admin/users?page=${page}&per_page=1000`);
    users.push(...batch);
    if (batch.length < 1000) return users;
  }
}

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const maskEmail = (e) => e.replace(/^(.{1,2})[^@]*(@.*)$/, "$1***$2");

function renderHtml(name, entries) {
  const cards = entries
    .map(({ day, message }) => {
      const m = SCHEDULE.find((s) => s.day === day);
      const head = m
        ? `${day}일차 · ${formatDayDateLong(m.date, "ko")}`
        : `${day}일차`;
      const talk = m ? `${esc(m.speakerKo)} — “${esc(m.titleKo)}”` : "";
      return `
      <div style="margin:0 0 18px;padding:14px 16px;border-left:3px solid #e0a83a;background:#fffaf0;border-radius:4px">
        <div style="font-size:12px;color:#8a6d2b;font-weight:600">${esc(head)}</div>
        <div style="font-size:13px;color:#666;margin:2px 0 8px">${talk}</div>
        <div style="font-size:15px;line-height:1.6;color:#222;white-space:pre-wrap">${esc(message)}</div>
      </div>`;
    })
    .join("");
  return `<div style="max-width:600px;margin:0 auto;font-family:-apple-system,'Apple SD Gothic Neo','Malgun Gothic',sans-serif;color:#222">
  <h2 style="margin:0 0 4px">🌳 빛의 나무 — 나의 간증 기록</h2>
  <p style="margin:0 0 20px;color:#666;font-size:14px">연차대회 33일 읽기 캠페인</p>
  <p style="font-size:15px;line-height:1.6">${esc(name)}님, 함께해 주셔서 감사합니다.<br>
  ${TOTAL_DAYS}일 중 <b>${entries.length}일</b> 동안 남겨 주신 간증을 모아 보내드립니다.</p>
  ${cards}
  <p style="margin-top:24px;font-size:13px;color:#888">이 메일은 캠페인에 참여하신 본인에게만 발송되었습니다.</p>
</div>`;
}

const [testimonies, users] = await Promise.all([fetchAllTestimonies(), fetchAllUsers()]);
const emailById = new Map(users.map((u) => [u.id, u.email]));

const byUser = new Map();
for (const t of testimonies) {
  if (!byUser.has(t.user_id)) byUser.set(t.user_id, []);
  byUser.get(t.user_id).push(t);
}

const reports = [];
const skippedNoEmail = [];
for (const [userId, rows] of byUser) {
  const email = emailById.get(userId);
  const name = rows[rows.length - 1].author_name;
  if (!email) {
    skippedNoEmail.push(name);
    continue;
  }
  rows.sort((a, b) => a.day - b.day);
  reports.push({
    to: email,
    name,
    daysCompleted: rows.length,
    subject: `[빛의 나무] ${name}님의 연차대회 읽기 캠페인 간증 기록`,
    html: renderHtml(name, rows),
  });
}
reports.sort((a, b) => b.daysCompleted - a.daysCompleted);

mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "reports.json"), JSON.stringify(reports, null, 2));
writeFileSync(join(outDir, "sample.html"), reports[0]?.html ?? "<p>no reports</p>");

console.log(`testimonies: ${testimonies.length}`);
console.log(`participants with testimonies: ${byUser.size}`);
console.log(`reports ready: ${reports.length}`);
console.log(`skipped (no email on file): ${skippedNoEmail.length}${skippedNoEmail.length ? " — " + skippedNoEmail.join(", ") : ""}`);
console.log("\nrecipients (masked):");
for (const r of reports) console.log(`  ${String(r.daysCompleted).padStart(2)}/${TOTAL_DAYS}  ${r.name}  <${maskEmail(r.to)}>`);
console.log(`\nwritten to ${join(outDir, "reports.json")} (contains full emails + testimonies — do not commit)`);
