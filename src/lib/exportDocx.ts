import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";
import { saveAs } from "file-saver";
import { getMission, formatDayDateLong } from "./schedule";
import type { Testimony } from "./types";

/**
 * Builds a Word (.docx) report of testimonies — grouped by day, each with its
 * Speaker and Talk Title — and triggers a browser download. Used by the
 * admin dashboard's "Export to Word" action (spec 2.E).
 */
export async function exportTestimoniesDocx(testimonies: Testimony[], reportTitle = "Tree of Light — Testimony Report") {
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
          text: `Generated ${new Date().toLocaleString("en-US", { dateStyle: "long", timeStyle: "short" })} · ${testimonies.length} testimonies across ${days.length} day(s)`,
          italics: true,
          color: "888888",
        }),
      ],
      spacing: { after: 300 },
    }),
  ];

  if (days.length === 0) {
    children.push(
      new Paragraph({ children: [new TextRun({ text: "No testimonies match the current filters.", italics: true })] }),
    );
  }

  for (const day of days) {
    const mission = getMission(day);
    const entries = byDay.get(day)!;
    children.push(
      new Paragraph({
        text: `Day ${day}${mission ? ` — ${formatDayDateLong(mission.date)}` : ""}`,
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 300, after: 60 },
      }),
    );
    if (mission) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: mission.title, bold: true }),
            new TextRun({ text: `   ·   ${mission.speaker}`, italics: true }),
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
