"use client";
import React from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";

type FooterGroup = { title: string; items: string[] };

export default function LinksSection() {
  const { lang } = useI18n();
  const d: FooterGroup[] = lang === "id"
    ? [
        { title: "Perusahaan", items: ["Tentang", "Koleksi", "Cara Belanja", "Karier"] },
        { title: "Bantuan", items: ["Bantuan Pelanggan", "Detail Pengiriman", "Syarat dan Ketentuan", "Kebijakan Privasi"] },
        { title: "Informasi", items: ["Akun", "Pesanan", "Pembayaran", "Pertanyaan Umum"] },
        { title: "Sumber", items: ["Panduan Belanja", "Perawatan Produk", "Jurnal MERX", "Kontak"] },
      ]
    : [
        { title: "Company", items: ["About", "Collections", "How to Shop", "Careers"] },
        { title: "Help", items: ["Customer Support", "Delivery Details", "Terms and Conditions", "Privacy Policy"] },
        { title: "Information", items: ["Account", "Orders", "Payments", "FAQs"] },
        { title: "Resources", items: ["Shopping Guide", "Product Care", "MERX Journal", "Contact"] },
      ];

  return (
    <>
      {d.map((group) => (
        <section className="flex flex-col mt-5" key={group.title}>
          <h3 className="font-medium text-sm md:text-base uppercase tracking-widest mb-6">{group.title}</h3>
          {group.items.map((label, i) => (
            <Link key={`${group.title}-${label}`} href={i === 0 ? "/account" : "/shop"} className="text-black/60 text-sm md:text-base mb-4 w-fit">
              {label}
            </Link>
          ))}
        </section>
      ))}
    </>
  );
}
