"use client";
import { useI18n } from "@/lib/i18n";
export default function LanguageAware(){ const {lang}=useI18n(); return <span className="sr-only" data-lang={lang}>{lang}</span>; }
