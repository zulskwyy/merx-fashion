"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import ProductCard from "@/components/common/ProductCard";
import { products as fallbackProducts } from "@/data/products";
import type { Product } from "@/types/product.types";
import { useI18n } from "@/lib/i18n";

const PAGE_SIZE = 12;

type ShopFilters = {
  query: string;
  category: string;
  color: string;
  gender: string;
  size: string;
  style: string;
  minPrice: number;
  maxPrice: number;
  sort: string;
};

const STYLE_RULES: Record<string, string[]> = {
  casual: ["t-shirt", "t-shirts", "graphic", "shirt", "hoodie", "casual"],
  formal: ["shirt", "polo", "formal"],
  party: ["graphic", "party"],
  gym: ["sportswear", "sport", "gym", "active"],
};

const swatchHex: Record<string, string> = {
  Black: "#111111",
  White: "#FFFFFF",
  Beige: "#D8C4A7",
  Blue: "#315C97",
  "Mixed Blue": "#557DB5",
  "Black & White": "#777777",
  Gray: "#8A8A8A",
  Orange: "#D97932",
  Pink: "#D991A6",
  Yellow: "#D7B84C",
  "Mixed Graphic": "#6C6C6C",
};

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function productMatchesStyle(product: Product, style: string) {
  if (style === "All") return true;
  const explicit = String(
    (product as Product & { style?: string; dressStyle?: string }).style ??
      (product as Product & { dressStyle?: string }).dressStyle ??
      "",
  );
  if (explicit && normalize(explicit) === normalize(style)) return true;

  const haystack = normalize(
    [
      product.title,
      product.category,
      product.description,
      product.sourceDescription,
      ...Object.values(product.details || {}),
    ].join(" "),
  );
  return (STYLE_RULES[normalize(style)] || []).some((term) => haystack.includes(term));
}

function parseUrlFilter(name: string, fallback = "") {
  const value = new URLSearchParams(window.location.search).get(name);
  return value || fallback;
}

export default function ShopPage() {
  const { t } = useI18n();
  const [products, setProducts] = useState<Product[]>(fallbackProducts);
  const [loadedFromDb, setLoadedFromDb] = useState(false);
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [draft, setDraft] = useState<ShopFilters>({
    query: "",
    category: "All",
    color: "All",
    gender: "All",
    size: "All",
    style: "All",
    minPrice: 0,
    maxPrice: Math.max(0, ...fallbackProducts.map((p) => p.price)),
    sort: "popular",
  });
  const [applied, setApplied] = useState<ShopFilters>(draft);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const categoryParam = params.get("category");
    const colorParam = params.get("color");
    const genderParam = params.get("gender");
    const sizeParam = params.get("size");
    const styleParam = params.get("style");
    const sortParam = params.get("sort");
    const q = params.get("q") || "";

    fetch("/api/catalog")
      .then((response) => response.json())
      .then((value: unknown) => {
        if (Array.isArray(value) && value.length) {
          setProducts(value as Product[]);
          setLoadedFromDb(true);
          const maxPrice = Math.max(0, ...(value as Product[]).map((p) => Number(p.price) || 0));
          setDraft((current) => ({ ...current, maxPrice }));
          setApplied((current) => ({ ...current, maxPrice }));
        }
      })
      .catch(() => undefined);

    const next: ShopFilters = {
      query: q,
      category: categoryParam || "All",
      color: colorParam || "All",
      gender: genderParam || "All",
      size: sizeParam || "All",
      style: styleParam || "All",
      minPrice: Number(params.get("minPrice") || 0),
      maxPrice: Number(params.get("maxPrice") || Math.max(0, ...fallbackProducts.map((p) => p.price))),
      sort: ["new", "low", "high", "popular"].includes(sortParam || "") ? String(sortParam) : "popular",
    };
    setDraft(next);
    setApplied(next);
  }, []);

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(products.map((p) => p.category).filter(Boolean)))],
    [products],
  );
  const colors = useMemo(
    () => ["All", ...Array.from(new Set(products.map((p) => p.color).filter(Boolean)))],
    [products],
  );
  const genders = useMemo(
    () => ["All", ...Array.from(new Set(products.map((p) => p.gender).filter(Boolean)))],
    [products],
  );
  const sizes = useMemo(
    () => ["All", ...Array.from(new Set(products.flatMap((p) => p.sizes || [])))],
    [products],
  );
  const maxProductPrice = useMemo(
    () => Math.max(0, ...products.map((p) => Number(p.price) || 0)),
    [products],
  );

  const filtered = useMemo(() => {
    const out = products.filter((product) => {
      const haystack = normalize(
        [product.title, product.category, product.color, product.gender, product.description].join(" "),
      );
      return (
        (!applied.query || haystack.includes(normalize(applied.query))) &&
        (applied.category === "All" || normalize(product.category) === normalize(applied.category)) &&
        (applied.color === "All" || normalize(product.color) === normalize(applied.color)) &&
        (applied.gender === "All" || normalize(product.gender) === normalize(applied.gender)) &&
        (applied.size === "All" || (product.sizes || []).some((size) => normalize(size) === normalize(applied.size))) &&
        productMatchesStyle(product, applied.style) &&
        Number(product.price) >= applied.minPrice &&
        Number(product.price) <= applied.maxPrice
      );
    });

    if (applied.sort === "low") out.sort((a, b) => a.price - b.price);
    if (applied.sort === "high") out.sort((a, b) => b.price - a.price);
    if (applied.sort === "new") out.sort((a, b) => b.id - a.id);
    if (applied.sort === "popular") out.sort((a, b) => b.rating - a.rating);
    return out;
  }, [products, applied]);

  useEffect(() => {
    const total = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    setPage((current) => Math.min(current, total));
  }, [filtered.length]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const shown = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function writeUrl(next: ShopFilters) {
    const params = new URLSearchParams();
    if (next.query) params.set("q", next.query);
    if (next.category !== "All") params.set("category", next.category);
    if (next.color !== "All") params.set("color", next.color);
    if (next.gender !== "All") params.set("gender", next.gender);
    if (next.size !== "All") params.set("size", next.size);
    if (next.style !== "All") params.set("style", next.style);
    if (next.minPrice > 0) params.set("minPrice", String(next.minPrice));
    if (next.maxPrice < maxProductPrice) params.set("maxPrice", String(next.maxPrice));
    if (next.sort !== "popular") params.set("sort", next.sort);
    const url = params.toString() ? `/shop?${params.toString()}` : "/shop";
    window.history.replaceState({}, "", url);
  }

  function applyFilters(next = draft) {
    const safeMax = Math.max(next.minPrice, next.maxPrice);
    const normalizedFilters = { ...next, maxPrice: safeMax };
    setApplied(normalizedFilters);
    setDraft(normalizedFilters);
    setPage(1);
    writeUrl(normalizedFilters);
    setOpen(false);
  }

  function resetFilters() {
    const next = {
      query: "",
      category: "All",
      color: "All",
      gender: "All",
      size: "All",
      style: "All",
      minPrice: 0,
      maxPrice: maxProductPrice,
      sort: "popular",
    };
    setDraft(next);
    setApplied(next);
    setPage(1);
    writeUrl(next);
  }

  function setFilter<K extends keyof ShopFilters>(key: K, value: ShopFilters[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
    setPage(1);
  }

  const FilterPanel = () => (
    <div className="space-y-5">
      <div>
        <div className="text-lg font-bold">{t("filters")}</div>
        <label className="mt-4 mb-2 block text-sm">{t("search")}</label>
        <input
          value={draft.query}
          onChange={(event) => setFilter("query", event.target.value)}
          placeholder={`${t("search")} produk...`}
          className="w-full rounded-xl bg-[#F3EFE7] px-4 py-3 outline-none transition-shadow focus:ring-2 focus:ring-[#1B2A4A]/20"
        />
      </div>

      <label className="block text-sm">
        {t("category")}
        <select
          value={draft.category}
          onChange={(event) => setFilter("category", event.target.value)}
          className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 outline-none transition focus:border-black/30"
        >
          {categories.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>

      <label className="block text-sm">
        {t("color")}
        <select
          value={draft.color}
          onChange={(event) => setFilter("color", event.target.value)}
          className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 outline-none transition focus:border-black/30"
        >
          {colors.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>

      <label className="block text-sm">
        {t("gender")}
        <select
          value={draft.gender}
          onChange={(event) => setFilter("gender", event.target.value)}
          className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 outline-none transition focus:border-black/30"
        >
          {genders.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>

      <div>
        <div className="text-sm">{t("size")}</div>
        <div className="mt-2 flex flex-wrap gap-2">
          {sizes.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setFilter("size", item)}
              className={`rounded-full border px-3 py-2 text-xs transition-all duration-200 hover:-translate-y-0.5 ${
                draft.size === item ? "border-[#1B2A4A] bg-[#1B2A4A] text-white" : "border-black/10 bg-white"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="text-sm">Dress Style</div>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {["All", "Casual", "Formal", "Party", "Gym"].map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setFilter("style", item)}
              className={`rounded-xl border px-3 py-2 text-sm transition-all duration-200 hover:-translate-y-0.5 ${
                draft.style === item ? "border-[#1B2A4A] bg-[#1B2A4A] text-white" : "border-black/10 bg-white"
              }`}
            >
              {item === "All" ? "Semua" : item}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between text-sm">
          <span>Harga</span>
          <span className="text-xs text-black/50">Rp {draft.minPrice.toLocaleString("id-ID")} – Rp {draft.maxPrice.toLocaleString("id-ID")}</span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <input
            type="number"
            min={0}
            max={draft.maxPrice}
            value={draft.minPrice}
            onChange={(event) => setFilter("minPrice", Math.max(0, Number(event.target.value) || 0))}
            className="w-full rounded-xl border border-black/10 px-3 py-2"
            placeholder="Min"
          />
          <input
            type="number"
            min={draft.minPrice}
            max={maxProductPrice}
            value={draft.maxPrice}
            onChange={(event) => setFilter("maxPrice", Math.min(maxProductPrice, Number(event.target.value) || 0))}
            className="w-full rounded-xl border border-black/10 px-3 py-2"
            placeholder="Max"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => applyFilters()}
          className="rounded-xl bg-[#1B2A4A] px-4 py-3 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0"
        >
          Terapkan
        </button>
        <button
          type="button"
          onClick={resetFilters}
          className="rounded-xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:bg-black/[0.03]"
        >
          {t("reset")}
        </button>
      </div>
    </div>
  );

  return (
    <main className="pb-20">
      <div className="mx-auto max-w-frame px-4 xl:px-0">
        <div className="flex items-center gap-2 py-5 text-sm text-black/50">
          <Link href="/">{t("home")}</Link>
          <span>/</span>
          <span>{t("shop")}</span>
        </div>

        <div className="mb-7 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold md:text-[40px]">{t("shop")}</h1>
            <p className="mt-1 text-black/60">
              {filtered.length} produk{loadedFromDb ? "" : " · katalog cadangan"}.
            </p>
          </div>
          <button
            type="button"
            className="rounded-full bg-[#1B2A4A] px-5 py-3 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg md:hidden"
            onClick={() => setOpen(true)}
          >
            {t("filters")}
          </button>
        </div>

        <div className="flex items-start gap-7">
          <aside className="hidden w-[270px] shrink-0 rounded-2xl border border-black/10 p-5 md:block">
            <FilterPanel />
          </aside>

          <section className="flex min-w-0 flex-1 flex-col gap-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-sm text-black/60">
                {t("showing")} {filtered.length ? (page - 1) * PAGE_SIZE + 1 : 0}–{Math.min(page * PAGE_SIZE, filtered.length)} dari {filtered.length}
              </span>
              <label className="flex items-center gap-2 text-sm">
                <span>{t("sortBy")}</span>
                <select
                  value={draft.sort}
                  onChange={(event) => {
                    const next = { ...draft, sort: event.target.value };
                    setDraft(next);
                    applyFilters(next);
                  }}
                  className="rounded-full border border-black/10 bg-[#F3EFE7] px-4 py-2 outline-none"
                >
                  <option value="popular">{t("popular")}</option>
                  <option value="new">{t("newest")}</option>
                  <option value="low">{t("lowHigh")}</option>
                  <option value="high">{t("highLow")}</option>
                </select>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
              {shown.map((product) => (
                <ProductCard key={product.id} data={product} />
              ))}
              {!shown.length && (
                <div className="col-span-full rounded-2xl border border-dashed border-black/10 py-20 text-center text-black/50">
                  {t("noProducts")}
                </div>
              )}
            </div>

            {totalPages > 1 && (
              <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
                {Array.from({ length: totalPages }, (_, index) => index + 1).map((number) => (
                  <button
                    key={number}
                    type="button"
                    onClick={() => setPage(number)}
                    className={`h-10 min-w-10 rounded-full border px-3 text-sm transition-all duration-200 hover:-translate-y-0.5 ${
                      number === page
                        ? "border-[#1B2A4A] bg-[#1B2A4A] text-white shadow-sm"
                        : "border-black/10 bg-white"
                    }`}
                  >
                    {number}
                  </button>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Tutup filter"
            className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-[90%] max-w-sm overflow-y-auto bg-white p-5 shadow-2xl animate-in slide-in-from-right duration-200">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute right-4 top-4 rounded-full border border-black/10 px-3 py-1 text-xl transition hover:rotate-90"
              aria-label="Tutup"
            >
              ×
            </button>
            <div className="pt-10">
              <FilterPanel />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
