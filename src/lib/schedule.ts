import type { MissionDay } from "./types";
import type { Language } from "./language";

/**
 * The 33-day mission schedule, Aug 18 - Sep 19, 2026.
 * Only ISO dates are stored here — weekday labels are always derived from
 * the date at render time (see `formatDayDate`) rather than hardcoded, so
 * they can never drift out of sync with the calendar.
 *
 * Korean speaker/title fields for days 1-30 are sourced from the official
 * Korean-language session page (churchofjesuschrist.org/study/general-conference/2026/04?lang=kor).
 * Days 31-33 could NOT be verified against that page — see the comment
 * above their entries — and still carry best-effort translations pending
 * clarification.
 */
export const SCHEDULE: MissionDay[] = [
  { day: 1, date: "2026-08-18", speaker: "Dallin H. Oaks", title: "Introduction / Alive in Christ", speakerKo: "댈린 에이치 옥스", titleKo: "서두 말씀 / 그리스도 안에서 살아 있나니" },
  { day: 2, date: "2026-08-19", speaker: "D. Todd Christofferson", title: "Solemn Assembly & The Character of Christ", speakerKo: "디 토드 크리스토퍼슨", titleKo: "성회 & 그리스도의 성품" },
  { day: 3, date: "2026-08-20", speaker: "Patrick Kearon", title: "About His Business", speakerKo: "패트릭 키아론", titleKo: "그분의 사업에 전념하여" },
  { day: 4, date: "2026-08-21", speaker: "Kristin M. Yee", title: "Ministering—“That Ye Love One Another; as I Have Loved You”", speakerKo: "크리스틴 엠 이", titleKo: "성역—“서로 사랑하라 내가 너희를 사랑한 것 같이”" },
  { day: 5, date: "2026-08-22", speaker: "Clark G. Gilbert", title: "Come Home", speakerKo: "클라크 지 길버트", titleKo: "내게 오라" },
  { day: 6, date: "2026-08-23", speaker: "David A. Bednar", title: "All Who Have Endured Valiantly", speakerKo: "데이비드 에이 베드나", titleKo: "용감히 견딘 자 모두" },
  { day: 7, date: "2026-08-24", speaker: "Michael John U. Teh", title: "Follow the Prophet; He Knows the Way", speakerKo: "마이클 존 유 테", titleKo: "선지자 따라 나아가세" },
  { day: 8, date: "2026-08-25", speaker: "Jorge T. Becerra", title: "Tithing—Putting God First", speakerKo: "호르헤 티 베세라", titleKo: "십일조—하나님을 최우선에 둠" },
  { day: 9, date: "2026-08-26", speaker: "Henry B. Eyring", title: "Prayers for Peace", speakerKo: "헨리 비 아이어링", titleKo: "평안을 구하는 기도" },
  { day: 10, date: "2026-08-27", speaker: "Gary E. Stevenson", title: "Lost Luggage, Redeemed Souls", speakerKo: "개리 이 스티븐슨", titleKo: "분실된 수하물, 구속된 영혼" },
  { day: 11, date: "2026-08-28", speaker: "Eduardo F. Ortega", title: "Christ—Author and Finisher of Our Faith", speakerKo: "에두아르도 에프 오르테가", titleKo: "그리스도, 우리 신앙의 창시자이시요 완성자" },
  { day: 12, date: "2026-08-29", speaker: "Wan-Liang Wu", title: "“I Will Give Away All My Sins to Know Thee”", speakerKo: "완량 우", titleKo: "“당신을 알기 위하여 나의 모든 죄를 버리겠나이다”" },
  { day: 13, date: "2026-08-30", speaker: "David J. Wunderli", title: "Jesus Christ Is Not Our Burden; He Is Our Relief", speakerKo: "데이비드 제이 원덜리", titleKo: "예수 그리스도는 짐이 아닌 위안이십니다" },
  { day: 14, date: "2026-08-31", speaker: "Gérald Caussé", title: "Love All; Love Each", speakerKo: "제럴드 코세", titleKo: "모두를 사랑하고, 한 사람 한 사람을 사랑하십시오" },
  { day: 15, date: "2026-09-01", speaker: "Brian J. Holmes", title: "Jesus Christ Is the Way", speakerKo: "브라이언 제이 홈즈", titleKo: "예수 그리스도는 길이십니다" },
  { day: 16, date: "2026-09-02", speaker: "Clement M. Matswagothata", title: "He Knows You by Name", speakerKo: "클레멘트 엠 마츠와고타타", titleKo: "그분께서는 여러분 각자의 이름을 알고 계십니다" },
  { day: 17, date: "2026-09-03", speaker: "Dieter F. Uchtdorf", title: "Encounter at the Empty Tomb", speakerKo: "디이터 에프 우흐트도르프", titleKo: "빈 무덤을 마주하며" },
  { day: 18, date: "2026-09-04", speaker: "Emily Belle Freeman", title: "Best Days and Worst Days", speakerKo: "에밀리 벨 프리먼", titleKo: "최고의 날과 최악의 날" },
  { day: 19, date: "2026-09-05", speaker: "Pedro X. Larreal", title: "I Feel My Savior's Love", speakerKo: "페드로 엑스 라레알", titleKo: "주 사랑 느껴요" },
  { day: 20, date: "2026-09-06", speaker: "Edward B. Rowe", title: "Choose Jesus Christ as Your Guide", speakerKo: "에드워드 비 로", titleKo: "예수 그리스도를 여러분의 인도자로 삼으십시오" },
  { day: 21, date: "2026-09-07", speaker: "Ronald A. Rasband", title: "He Is Risen", speakerKo: "로널드 에이 래스번드", titleKo: "그가 살아나셨느니라" },
  { day: 22, date: "2026-09-08", speaker: "Dale G. Renlund", title: "Because of Jesus Christ", speakerKo: "데일 지 렌런드", titleKo: "예수 그리스도 덕분에" },
  { day: 23, date: "2026-09-09", speaker: "Thierry K. Mutombo", title: "The Joy of a Covenant Relationship with God", speakerKo: "티에리 케이 무톰보", titleKo: "하나님과 맺은 성약의 관계에서 오는 기쁨" },
  { day: 24, date: "2026-09-10", speaker: "Alan R. Walker", title: "A Peculiar Treasure", speakerKo: "앨런 알 워커", titleKo: "특별한 보물" },
  { day: 25, date: "2026-09-11", speaker: "Chi Hong (Sam) Wong", title: "Remember “Remember, Remember”", speakerKo: "치 홍 (샘) 웡", titleKo: "기억하고 기억하라" },
  { day: 26, date: "2026-09-12", speaker: "Aaron T. Hall", title: "I Glory in My Jesus", speakerKo: "에런 티 홀", titleKo: "나는 나의 예수를 자랑하노라" },
  { day: 27, date: "2026-09-13", speaker: "Susan H. Porter", title: "Here Am I, Send Me", speakerKo: "수전 에이치 포터", titleKo: "“내가 여기 있사오니 나를 보내소서”" },
  { day: 28, date: "2026-09-14", speaker: "Neil L. Andersen", title: "Eternal Marriage is an Eternal Journey", speakerKo: "닐 엘 앤더슨", titleKo: "영원한 결혼은 영원한 여정입니다" },
  { day: 29, date: "2026-09-15", speaker: "Quentin L. Cook", title: "Keys, Covenants and Easter", speakerKo: "퀜틴 엘 쿡", titleKo: "열쇠, 성약, 그리고 부활절" },
  { day: 30, date: "2026-09-16", speaker: "Gerrit W. Gong", title: "Abide With Me; 'Tis Eastertide", speakerKo: "게릿 더블유 공", titleKo: "이 부활 절기에 누구도 홀로 걷게 하지 마십시오" },
  // NOT verified against the official 2026/04 Korean session page — see chat:
  // this session's Soares talk is actually "참포도나무이신 예수 그리스도" (a
  // different title than below), Holland doesn't appear in this session at
  // all, and Andersen only has the one talk used on Day 28. Titles below are
  // still best-effort translations pending clarification.
  { day: 31, date: "2026-09-17", speaker: "Ulisses Soares", title: "Bright and Glorious Morning", speakerKo: "울리세스 소아레스", titleKo: "밝고 영광스러운 아침" },
  { day: 32, date: "2026-09-18", speaker: "Jeffrey R. Holland", title: "The Motion of a Hidden Fire", speakerKo: "제프리 알 홀런드", titleKo: "숨겨진 불꽃의 움직임" },
  { day: 33, date: "2026-09-19", speaker: "Neil L. Andersen", title: "The Triumph of Hope", speakerKo: "닐 엘 앤더슨", titleKo: "소망의 승리" },
];

export const TOTAL_DAYS = SCHEDULE.length;
export const CONFERENCE_DATE = SCHEDULE[TOTAL_DAYS - 1].date;
export const JOURNEY_START_DATE = SCHEDULE[0].date;

/**
 * Official General Conference session this schedule's talks are drawn from.
 * Individual per-talk URLs are intentionally NOT generated — there's no
 * reliable way to derive the exact page slug for each of the 33 talks, and
 * a guessed/broken link is worse than none. This links to the real,
 * confirmed session index page instead, in the visitor's chosen language.
 */
export const CONFERENCE_LINKS: Record<Language, string> = {
  en: "https://www.churchofjesuschrist.org/study/general-conference/2026/04?lang=eng",
  ko: "https://www.churchofjesuschrist.org/study/general-conference/2026/04?lang=kor",
};

export function getMission(day: number): MissionDay | undefined {
  return SCHEDULE.find((m) => m.day === day);
}

export function getMissionTitle(mission: MissionDay, lang: Language): string {
  return lang === "ko" ? mission.titleKo : mission.title;
}

export function getMissionSpeaker(mission: MissionDay, lang: Language): string {
  return lang === "ko" ? mission.speakerKo : mission.speaker;
}

const DATE_LOCALE: Record<Language, string> = { en: "en-US", ko: "ko-KR" };

/** Formats a short localized date, e.g. "Tue, Aug 18" or "8월 18일 (화)" — weekday is always computed, never stored. */
export function formatDayDate(iso: string, lang: Language = "ko"): string {
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString(DATE_LOCALE[lang], { weekday: "short", month: "short", day: "numeric" });
}

export function formatDayDateLong(iso: string, lang: Language = "ko"): string {
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString(DATE_LOCALE[lang], { weekday: "long", month: "long", day: "numeric", year: "numeric" });
}

/**
 * Returns the current in-journey day number (1-33) based on real calendar time,
 * or null if today falls outside the 33-day window entirely.
 */
export function getCurrentJourneyDay(now: Date = new Date()): number | null {
  const todayIso = now.toISOString().slice(0, 10);
  if (todayIso < JOURNEY_START_DATE) return null;
  if (todayIso > CONFERENCE_DATE) return null;
  const startMs = new Date(`${JOURNEY_START_DATE}T00:00:00`).getTime();
  const todayMs = new Date(`${todayIso}T00:00:00`).getTime();
  const diffDays = Math.round((todayMs - startMs) / 86_400_000);
  return Math.min(TOTAL_DAYS, Math.max(1, diffDays + 1));
}

export function generateMissionPrompt(mission: MissionDay, lang: Language = "ko"): string {
  const title = getMissionTitle(mission, lang);
  const speaker = getMissionSpeaker(mission, lang);
  return lang === "ko"
    ? `${speaker}의 “${title}” 말씀을 읽거나 들어보세요. 그런 다음 오늘의 미션을 완료하고 배우거나 느낀 점을 짧은 간증으로 나눠주세요.`
    : `Read or listen to “${title}” by ${speaker}. Then complete today's mission and share a brief testimony of what you learned or felt.`;
}
