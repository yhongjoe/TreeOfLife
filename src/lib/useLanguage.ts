"use client";

import { useSyncExternalStore } from "react";
import { getLanguage, subscribeLanguage, type Language } from "./language";

export function useLanguage(): Language {
  return useSyncExternalStore(subscribeLanguage, getLanguage, getLanguage);
}
