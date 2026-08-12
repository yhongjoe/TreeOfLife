"use client";

import { useLanguage } from "@/lib/useLanguage";
import { setLanguage } from "@/lib/language";
import { useTranslation } from "@/lib/i18n/translations";

export default function LanguageToggle() {
  const lang = useLanguage();
  const { t } = useTranslation();

  return (
    <button
      type="button"
      onClick={() => setLanguage(lang === "ko" ? "en" : "ko")}
      className="rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-stone-600 shadow-sm transition hover:bg-white"
    >
      {t("languageToggleLabel")}
    </button>
  );
}
