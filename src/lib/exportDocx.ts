import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";
import { saveAs } from "file-saver";
import { getMission, formatDayDateLong, getMissionTitle, getMissionSpeaker } from "./schedule";
import type { Testimony } from "./types";
import type { Language } from "./language";

const STRINGS: Record<Language, { generated: (date: string, count: number, days: number) => string; noMatch: string; day: string }> = {
  en: {
    generated: (date, count, days) => `Generated ${date} · ${count} testimonies across ${days} day(s)`,
    noMatch: "No testimonies match the current filters.",
    day: "Day",
  },
  ko: {
    generated: (date, count, days) => `생성일: ${date} · ${days}일 동안 총 ${count}개의 간증`,
    noMatch: "필터 조건에 맞는 간증이 없습니다.",
    day: "일차",
  },
};

/**
 * Builds a Word (.docx) report of testimonies — grouped by day, each with its
 * Speaker and Talk Title — and triggers a browser download. Used by the
 * admin dashboard's "Export to Word" action (spec 2.E).
 */
export async function exportTestimoniesDocx(
  testimonies: Testimony[],
  reportTitle = "Tree of Light — Testimony Report",
  lang: Language = "ko",
) {
  const s = STRINGS[lang];
  const localeTag = lang === "ko" ? "ko-KR" : "en-US";
  const byDay = new Map<number, Testimony[]>();
  for (const t of testimonies) {
    if (!byDay.has(t.day)) byDay.set(t.day, []);
    byDay.get(t.day)!.push(t);
  }
  const days = Array.from(byDay.keys()).sort((a, b) => a - b);

  const children: Paragraph[] = [
    new Paragraph({ text: reportTitle, heading: HeadingLevel.TITLE }),
    new Paragraph({
      children: [
        new TextRun({
          text: s.generated(new Date().toLocaleString(localeTag, { dateStyle: "long", timeStyle: "short" }), testimonies.length, days.length),
          italics: true,
          color: "888888",
        }),
      ],
      spacing: { after: 300 },
    }),
  ];

  if (days.length === 0) {
    children.push(new Paragraph({ children: [new TextRun({ text: s.noMatch, italics: true })] }));
  }

  for (const day of days) {
    const mission = getMission(day);
    const entries = byDay.get(day)!;
    const dayHeading = lang === "ko" ? `${day}${s.day}` : `${s.day} ${day}`;
    children.push(
      new Paragraph({
        text: `${dayHeading}${mission ? ` — ${formatDayDateLong(mission.date, lang)}` : ""}`,
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 300, after: 60 },
      }),
    );
    if (mission) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: getMissionTitle(mission, lang), bold: true }),
            new TextRun({ text: `   ·   ${getMissionSpeaker(mission, lang)}`, italics: true }),
          ],
          spacing: { after: 150 },
        }),
      );
    }
    for (const t of entries) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: `${t.authorName}: `, bold: true }), new TextRun({ text: t.message })],
          spacing: { after: 100 },
        }),
      );
    }
  }

  const doc = new Document({ sections: [{ children }] });
  const blob = await Packer.toBlob(doc);
  const filename = `tree-of-light-testimonies-${new Date().toISOString().slice(0, 10)}.docx`;
  saveAs(blob, filename);
}
