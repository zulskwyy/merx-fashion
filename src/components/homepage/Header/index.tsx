"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { integralCF } from "@/styles/fonts";
import { useI18n } from "@/lib/i18n";
import { products } from "@/data/products";
import { formatIDR, discountedPrice } from "@/lib/catalog";
import { useStoreSettings } from "@/lib/store-settings";

const HERO_IDS = [0, 4, 6];

export default function Header() {
  const { t } = useI18n();
  const settings = useStoreSettings();
  const [active, setActive] = useState(0);
  const [catalog, setCatalog] = useState(products);
  useEffect(() => { fetch("/api/catalog").then(r=>r.json()).then(v=>{ if (Array.isArray(v) && v.length) setCatalog(v); }).catch(()=>{}); }, []);

  const slides = useMemo(
    () => HERO_IDS.map((index) => catalog[index]).filter(Boolean),
    [catalog]
  );

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % slides.length);
    }, 5200);
    return () => window.clearInterval(timer);
  }, [slides.length]);

  const product = slides[active];
  const salePrice = product ? discountedPrice(product) : 0;

  const next = () => setActive((current) => (current + 1) % slides.length);
  const previous = () =>
    setActive((current) => (current - 1 + slides.length) % slides.length);

  return (
    <header className="overflow-hidden bg-[#f7f4ee]">
      <div className="mx-auto grid min-h-[620px] max-w-frame grid-cols-1 md:grid-cols-[0.9fr_1.1fr] lg:min-h-[690px]">
        <section className="relative order-2 flex flex-col justify-center px-6 py-14 sm:px-10 md:order-1 md:px-12 lg:px-16">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="mb-5 text-[11px] font-medium uppercase tracking-[0.32em] text-black/45">
              MERX / {t("newCollection")}
            </p>
            <h1
              className={`${integralCF.className} max-w-[630px] text-5xl leading-[1.02] sm:text-6xl lg:text-[74px]`}
            >
              {settings.heroTitle || t("timeless")}
            </h1>
            <p className="mt-7 max-w-[540px] text-base leading-7 text-black/60 lg:text-lg">
              {settings.heroDescription || t("heroText")}
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link
                href="/shop"
                className="inline-flex h-12 items-center justify-center rounded-full px-8 text-sm font-medium text-white transition duration-300 hover:-translate-y-0.5 hover:opacity-90" style={{ backgroundColor: settings.primaryColor }}
              >
                {t("shopNow")}
                <span aria-hidden="true" className="ml-3 text-base">
                  →
                </span>
              </Link>
              <Link
                href="/shop?sort=new"
                className="inline-flex h-12 items-center justify-center rounded-full border border-black/15 bg-white/50 px-7 text-sm font-medium text-black transition duration-300 hover:bg-white"
              >
                {t("newArrivals")}
              </Link>
            </div>

            <div className="mt-12 grid max-w-[500px] grid-cols-2 gap-4 border-t border-black/10 pt-5 sm:grid-cols-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-black/40">
                  Pilihan warna
                </p>
                <p className="mt-1 text-sm font-medium text-[#1B2A4A]">
                  {product?.color || "—"}
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-black/40">
                  Ukuran
                </p>
                <p className="mt-1 text-sm font-medium text-[#1B2A4A]" style={{color: settings.primaryColor}}>
                  {product?.sizes?.slice(0, 4).join(" · ") || "XS · S · M · L"}
                </p>
              </div>
              <div className="hidden sm:block">
                <p className="text-[11px] uppercase tracking-[0.18em] text-black/40">
                  Harga mulai
                </p>
                <p className="mt-1 text-sm font-medium text-[#1B2A4A]" style={{color: settings.primaryColor}}>
                  {product ? formatIDR(salePrice) : "—"}
                </p>
              </div>
            </div>
          </motion.div>
        </section>

        <section className="relative order-1 min-h-[420px] overflow-hidden md:order-2 md:min-h-full">
          <div className="absolute inset-0 bg-[#eae3d8]" />

          <AnimatePresence mode="wait">
            {product && (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.99 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0"
              >
                <img
                  src={product?.srcUrl || settings.heroImageUrl}
                  alt={product?.title || settings.storeName}
                  className="h-full w-full object-cover object-center"
                  loading={active === 0 ? "eager" : "lazy"}
                  onError={(event) => { event.currentTarget.src = settings.heroImageUrl || "/images/header-homepage.png"; }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/45 via-black/5 to-transparent px-6 pb-7 pt-24 sm:px-10">
            <div className="flex items-end justify-between gap-5 text-white">
              <AnimatePresence mode="wait">
                {product && (
                  <motion.div
                    key={`${product.id}-caption`}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.45 }}
                  >
                    <p className="text-[11px] uppercase tracking-[0.28em] text-white/65">
                      Pilihan editor MERX
                    </p>
                    <h2 className="mt-2 max-w-[380px] text-xl font-medium sm:text-2xl">
                      {product.title}
                    </h2>
                    <p className="mt-1 text-sm text-white/80">
                      {formatIDR(salePrice)}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label="Sebelumnya"
                  onClick={previous}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/40 bg-black/10 text-white backdrop-blur-sm transition hover:bg-white hover:text-black"
                >
                  ←
                </button>
                <button
                  type="button"
                  aria-label="Berikutnya"
                  onClick={next}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/40 bg-black/10 text-white backdrop-blur-sm transition hover:bg-white hover:text-black"
                >
                  →
                </button>
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              {slides.map((slide, index) => (
                <button
                  key={slide.id}
                  type="button"
                  aria-label={`Tampilkan slide ${index + 1}`}
                  onClick={() => setActive(index)}
                  className="group flex items-center"
                >
                  <span
                    className={`block h-1.5 rounded-full transition-all duration-500 ${
                      active === index ? "w-10 bg-white" : "w-5 bg-white/45 group-hover:bg-white/75"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="absolute right-5 top-5 hidden rounded-2xl border border-white/30 bg-white/85 px-4 py-3 shadow-[0_18px_50px_rgba(0,0,0,0.12)] backdrop-blur-md sm:block"
          >
            <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-black/45">
              {settings.storeName}
            </p>
            <p className="mt-1 text-sm font-medium text-[#1B2A4A]">
              {t("browseStyle")}
            </p>
          </motion.div>
        </section>
      </div>
    </header>
  );
}
