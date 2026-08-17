"use client";

import { useLanguage } from "@/lib/useLanguage";
import type { Language } from "@/lib/language";

const en = {
  appName: "Tree of Light",
  appSubtitle: "A 33-day journey to Stake Conference · Aug 18 – Sep 19, 2026",
  footerText: "Built for your Stake Conference journey · Aug 18 – Sep 19, 2026",

  journeyBegins: "Journey begins {date}",
  conferenceToday: "Stake Conference is today!",
  dayOfTotal: "Day {day} of {total}",

  setYourName: "Set your name",
  yourNamePlaceholder: "Your name",
  signIn: "Sign in",
  signOut: "Sign out",
  adminPanel: "Admin Panel",
  previewAdminDemo: "Preview Admin (demo)",
  previewAdminTitle: "Demo only — production gates this via Supabase profiles.role, not a client toggle",

  testimoniesSharedAcrossTree: "{count} testimonies shared across the tree",
  overallParticipation: "{pct}% overall participation",

  scheduleHeading: "33-Day Mission & Talk Schedule",
  dayLabel: "Day {day}",
  today: "Today",
  sharedCount: "{count} shared",
  readAndShare: "Read & Share",

  beFirstToShare: "Be the first to share a testimony today.",

  dayOfTotalDate: "Day {day} of 33 · {date}",
  loadingTestimonies: "Loading testimonies…",
  noTestimoniesYet: "No testimonies yet — be the first to share today.",
  close: "Close",
  updateYourTestimony: "Update your testimony for today",
  shareYourTestimony: "Share your testimony for today",
  whatDidYouLearn: "What did you learn or feel today?",
  sharing: "Sharing…",
  update: "Update",
  share: "Share",
  genericError: "Something went wrong. Please try again.",
  readFullTalk: "Read Full Talk (Official Site)",

  justNow: "just now",
  minutesAgo: "{n}m ago",
  hoursAgo: "{n}h ago",
  daysAgo: "{n}d ago",

  signInToShare: "Sign in to share your testimony each day.",
  demoModeNotice:
    "This deployment is running in local demo mode, so no sign-in is required — everything already works. See DEPLOYMENT.md to turn on real Supabase auth for a live stake deployment.",
  signedInAs: "You're signed in as {email}.",
  goToTree: "Go to the Tree",
  backToTreeArrow: "← Back to the Tree",

  password: "Password",
  passwordPlaceholder: "Password",
  confirmPasswordPlaceholder: "Confirm password",
  createAccountTab: "Create Account",
  signInTab: "Sign In",
  createAccountButton: "Create Account",
  sending: "Sending…",
  signingIn: "Signing in…",
  creatingAccount: "Creating account…",
  passwordMismatch: "Passwords don't match.",
  passwordTooShort: "Password must be at least 6 characters.",
  emailAlreadyRegistered: "This email is already registered — you don't have a password set yet, or forgot it. Use the button below to set one.",
  forgotPassword: "Forgot your password?",
  firstTimeSetPassword: "First time here, or signed in with a link before? Set a password.",
  sendResetLink: "Send Password Link",
  resetLinkSent: "Sent a one-time link to {email} — click it, then set your password. After that you can sign in with email + password directly, no more links needed.",
  accountCreatedCheckEmail: "Account created. Check {email} to confirm, then sign in.",
  accountCreatedSignedIn: "Account created — you're signed in.",
  backToSignIn: "← Back to sign in",
  setNewPassword: "Set a New Password",
  setNewPasswordDesc: "Choose a password. From now on you can sign in with your email and this password — no more waiting for a link.",
  newPasswordPlaceholder: "New password",
  savePassword: "Save Password",
  passwordSaved: "Password saved! You can now sign in with your email and password anytime.",
  invalidOrExpiredRecoveryLink: "This link is invalid or has expired. Request a new one from the login page.",

  signingYouIn: "Signing you in…",
  linkExpired: "That link looks expired or invalid.",
  trySigningInAgain: "Try signing in again",

  adminsOnly: "Admins only",
  adminsOnlyDesc:
    "This dashboard is restricted to stake leaders. In production, access is enforced server-side by the profiles.role column and Postgres row-level security — never a client toggle.",
  backToTree: "Back to Tree",
  adminPanelTitle: "Tree of Light — Admin Panel",
  adminPanelSubtitle: "Participation reporting, exports, and fruit reset controls.",
  exitAdminDemo: "Exit admin (demo: {name})",
  you: "you",
  registeredMembers: "Registered members (est.)",
  uniqueParticipants: "Unique participants",
  testimoniesSubmitted: "Testimonies submitted",
  overallParticipationLabel: "Overall participation",
  testimoniesHeading: "Testimonies",
  exportButton: "Export to Word (.docx) — {count} {entryWord}",
  entry: "entry",
  entries: "entries",
  allDays: "All days",
  filterByMemberName: "Filter by member name…",
  clearFilters: "Clear filters",
  tableDay: "Day",
  tableSpeakerTalk: "Speaker / Talk",
  tableMember: "Member",
  tableTestimony: "Testimony",
  tableSubmitted: "Submitted",
  noTestimoniesMatch: "No testimonies match these filters.",
  memberRosterHeading: "Member roster",
  tableDaysCompleted: "Days completed",
  tableLastSubmission: "Last submission",
  noMembersYet: "No members have participated yet.",
  dangerZoneHeading: "Danger zone — reset fruit status",
  dangerZoneDesc: "Permanently deletes testimonies and resets the affected fruit(s) back to Level 0. This cannot be undone.",
  selectADay: "Select a day…",
  resetSelectedDay: "Reset selected day",
  resetAll33: "Reset all 33 fruits",
  resetDayConfirmTitle: "Reset Day {day}?",
  resetDayConfirmDesc: "This deletes every testimony submitted for this day and returns its fruit to a dark, unlit state.",
  resetThisDay: "Reset this day",
  resetAllConfirmTitle: "Reset all 33 fruits?",
  resetAllConfirmDesc: "This deletes every testimony across the entire tree and returns all fruit to Level 0. This cannot be undone.",
  resetEverything: "Reset everything",
  cancel: "Cancel",
  working: "Working…",

  languageToggleLabel: "한국어",
} as const;

const ko: Record<keyof typeof en, string> = {
  appName: "빛의 나무",
  appSubtitle: "스테이크 대회를 위한 33일간의 여정 · 2026년 8월 18일 – 9월 19일",
  footerText: "스테이크 대회 여정을 위해 제작됨 · 2026년 8월 18일 – 9월 19일",

  journeyBegins: "여정은 {date}에 시작됩니다",
  conferenceToday: "오늘이 스테이크 대회 날입니다!",
  dayOfTotal: "{total}일 중 {day}일째",

  setYourName: "이름을 입력하세요",
  yourNamePlaceholder: "이름",
  signIn: "로그인",
  signOut: "로그아웃",
  adminPanel: "관리자 패널",
  previewAdminDemo: "관리자 미리보기 (데모)",
  previewAdminTitle: "데모 전용 — 실제 배포에서는 클라이언트 토글이 아닌 Supabase profiles.role로 접근을 제어합니다",

  testimoniesSharedAcrossTree: "나무 전체에 {count}개의 간증이 공유되었습니다",
  overallParticipation: "전체 참여율 {pct}%",

  scheduleHeading: "33일 미션 및 말씀 일정",
  dayLabel: "{day}일차",
  today: "오늘",
  sharedCount: "{count}명 공유",
  readAndShare: "읽고 공유하기",

  beFirstToShare: "오늘 첫 번째로 간증을 나눠보세요.",

  dayOfTotalDate: "33일 중 {day}일차 · {date}",
  loadingTestimonies: "간증을 불러오는 중…",
  noTestimoniesYet: "아직 간증이 없습니다 — 오늘 첫 번째로 나눠보세요.",
  close: "닫기",
  updateYourTestimony: "오늘의 간증을 수정하세요",
  shareYourTestimony: "오늘의 간증을 나눠주세요",
  whatDidYouLearn: "오늘 무엇을 배우거나 느끼셨나요?",
  sharing: "공유하는 중…",
  update: "수정",
  share: "공유",
  genericError: "문제가 발생했습니다. 다시 시도해주세요.",
  readFullTalk: "말씀 전문 보기 (공식 사이트)",

  justNow: "방금 전",
  minutesAgo: "{n}분 전",
  hoursAgo: "{n}시간 전",
  daysAgo: "{n}일 전",

  signInToShare: "매일 간증을 나누려면 로그인하세요.",
  demoModeNotice:
    "이 배포는 로컬 데모 모드로 실행 중이라 로그인이 필요하지 않습니다 — 모든 기능이 이미 작동합니다. 실제 스테이크 배포를 위한 Supabase 인증을 활성화하려면 DEPLOYMENT.md를 참고하세요.",
  signedInAs: "{email}(으)로 로그인되어 있습니다.",
  goToTree: "나무로 이동",
  backToTreeArrow: "← 나무로 돌아가기",

  password: "비밀번호",
  passwordPlaceholder: "비밀번호",
  confirmPasswordPlaceholder: "비밀번호 확인",
  createAccountTab: "계정 만들기",
  signInTab: "로그인",
  createAccountButton: "계정 만들기",
  sending: "전송 중…",
  signingIn: "로그인 중…",
  creatingAccount: "계정 만드는 중…",
  passwordMismatch: "비밀번호가 일치하지 않습니다.",
  passwordTooShort: "비밀번호는 최소 6자 이상이어야 합니다.",
  emailAlreadyRegistered: "이미 가입된 이메일입니다 — 아직 비밀번호를 설정하지 않으셨거나 잊으신 것 같아요. 아래 버튼으로 비밀번호를 설정해주세요.",
  forgotPassword: "비밀번호를 잊으셨나요?",
  firstTimeSetPassword: "처음이시거나 이전에 링크로만 로그인하셨나요? 비밀번호를 설정하세요.",
  sendResetLink: "비밀번호 설정 링크 보내기",
  resetLinkSent: "{email}로 1회용 링크를 보냈습니다 — 클릭 후 비밀번호를 설정하세요. 그 다음부터는 이메일과 비밀번호로 바로 로그인할 수 있어요, 더 이상 링크가 필요 없습니다.",
  accountCreatedCheckEmail: "계정이 생성되었습니다. {email}을 확인해 인증한 후 로그인해주세요.",
  accountCreatedSignedIn: "계정이 생성되었습니다 — 로그인되었습니다.",
  backToSignIn: "← 로그인으로 돌아가기",
  setNewPassword: "새 비밀번호 설정",
  setNewPasswordDesc: "비밀번호를 설정하세요. 이제부터 이메일과 이 비밀번호로 로그인할 수 있습니다 — 더 이상 링크를 기다릴 필요가 없어요.",
  newPasswordPlaceholder: "새 비밀번호",
  savePassword: "비밀번호 저장",
  passwordSaved: "비밀번호가 저장되었습니다! 이제 언제든 이메일과 비밀번호로 로그인할 수 있습니다.",
  invalidOrExpiredRecoveryLink: "이 링크가 유효하지 않거나 만료되었습니다. 로그인 페이지에서 새로 요청해주세요.",

  signingYouIn: "로그인 처리 중…",
  linkExpired: "링크가 만료되었거나 유효하지 않은 것 같습니다.",
  trySigningInAgain: "다시 로그인 시도하기",

  adminsOnly: "관리자 전용",
  adminsOnlyDesc:
    "이 대시보드는 스테이크 지도자만 이용할 수 있습니다. 실제 운영 환경에서는 클라이언트 토글이 아닌 profiles.role 컬럼과 Postgres 행 수준 보안(RLS)으로 서버에서 접근을 제어합니다.",
  backToTree: "나무로 돌아가기",
  adminPanelTitle: "빛의 나무 — 관리자 패널",
  adminPanelSubtitle: "참여 현황 리포트, 내보내기, 열매 초기화 기능.",
  exitAdminDemo: "관리자 종료 (데모: {name})",
  you: "회원님",
  registeredMembers: "등록 회원 수(추정)",
  uniqueParticipants: "참여한 고유 회원 수",
  testimoniesSubmitted: "제출된 간증 수",
  overallParticipationLabel: "전체 참여율",
  testimoniesHeading: "간증 목록",
  exportButton: "Word로 내보내기(.docx) — {count}{entryWord}",
  entry: "건",
  entries: "건",
  allDays: "전체 일자",
  filterByMemberName: "회원 이름으로 검색…",
  clearFilters: "필터 초기화",
  tableDay: "일자",
  tableSpeakerTalk: "발표자 / 말씀",
  tableMember: "회원",
  tableTestimony: "간증",
  tableSubmitted: "제출 시각",
  noTestimoniesMatch: "필터 조건에 맞는 간증이 없습니다.",
  memberRosterHeading: "회원 명단",
  tableDaysCompleted: "완료한 일수",
  tableLastSubmission: "마지막 제출",
  noMembersYet: "아직 참여한 회원이 없습니다.",
  dangerZoneHeading: "위험 구역 — 열매 상태 초기화",
  dangerZoneDesc: "간증을 영구적으로 삭제하고 해당 열매를 0단계로 초기화합니다. 이 작업은 되돌릴 수 없습니다.",
  selectADay: "날짜 선택…",
  resetSelectedDay: "선택한 날짜 초기화",
  resetAll33: "33개 열매 전체 초기화",
  resetDayConfirmTitle: "{day}일차를 초기화할까요?",
  resetDayConfirmDesc: "이 날짜에 제출된 모든 간증을 삭제하고 열매를 어두운 상태로 되돌립니다.",
  resetThisDay: "이 날짜 초기화",
  resetAllConfirmTitle: "33개 열매를 모두 초기화할까요?",
  resetAllConfirmDesc: "나무 전체의 모든 간증을 삭제하고 모든 열매를 0단계로 되돌립니다. 이 작업은 되돌릴 수 없습니다.",
  resetEverything: "전체 초기화",
  cancel: "취소",
  working: "처리 중…",

  languageToggleLabel: "English",
};

const dictionaries: Record<Language, Record<keyof typeof en, string>> = { en, ko };

export type TranslationKey = keyof typeof en;

function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  let result = template;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replaceAll(`{${key}}`, String(value));
  }
  return result;
}

export function translate(lang: Language, key: TranslationKey, vars?: Record<string, string | number>): string {
  return interpolate(dictionaries[lang][key], vars);
}

export function useTranslation() {
  const lang = useLanguage();
  return {
    lang,
    t: (key: TranslationKey, vars?: Record<string, string | number>) => translate(lang, key, vars),
  };
}
