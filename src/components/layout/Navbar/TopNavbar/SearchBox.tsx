"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useI18n } from "@/lib/i18n";

export default function SearchBox({ mobile = false }: { mobile?: boolean }) {
  const router = useRouter();
  const { t } = useI18n();
  const [q, setQ] = useState("");
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const value = q.trim();
    router.push(value ? `/shop?q=${encodeURIComponent(value)}` : "/shop");
  };

  return (
    <form
      onSubmit={submit}
      className={mobile ? "flex items-center gap-2 rounded-full bg-[#F3EFE7] px-4 py-2" : "hidden lg:flex items-center gap-2 rounded-full bg-[#F3EFE7] px-4 py-2 w-full max-w-[360px]"}
    >
      <button type="submit" aria-label={t("search")} className="shrink-0">
        <Image src="/icons/search-black.svg" width={18} height={18} alt="" />
      </button>
      <input
        value={q}
        onChange={(event) => setQ(event.target.value)}
        type="search"
        placeholder={`${t("search")} produk...`}
        className="w-full bg-transparent text-sm outline-none placeholder:text-black/40"
      />
    </form>
  );
}
