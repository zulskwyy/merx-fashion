"use client";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type Lang = "id" | "en";
type I18nContext = { lang: Lang; setLang: (lang: Lang) => void; t: (key: string) => string };

const translations: Record<Lang, Record<string, string>> = {
  id: {
    home:"Beranda", shop:"Belanja", about:"Tentang", contact:"Kontak", account:"Akun", cart:"Keranjang",
    sale:"Promo", newArrivals:"Produk Terbaru", brands:"Koleksi", shopNow:"Belanja Sekarang", viewAll:"Lihat Semua",
    timeless:"Gaya yang tetap relevan, dibuat untuk dikenakan lama", heroText:"Koleksi terpilih untuk kamu yang mengutamakan kualitas, kenyamanan, dan gaya yang tidak berlebihan.",
    internationalBrands:"Merek pilihan", qualityProducts:"Produk berkualitas", happyCustomers:"Pelanggan puas", newCollection:"Koleksi terbaru 2026",
    browseStyle:"Jelajahi berdasarkan gaya", casual:"Kasual", formal:"Formal", party:"Pesta", gym:"Aktif",
    topSelling:"Paling Banyak Dipilih", happyReviews:"Cerita Pelanggan", signupBanner:"Daftar dan dapatkan potongan 10% untuk pesanan pertama.", signup:"Daftar sekarang",
    latestOffers:"Dapatkan kabar tentang penawaran terbaru", emailPlaceholder:"Masukkan alamat email", subscribe:"Berlangganan", subscribed:"Berhasil berlangganan",
    orderSummary:"Ringkasan Pesanan", subtotal:"Subtotal", productDiscounts:"Potongan produk", delivery:"Pengiriman", free:"Gratis", total:"Total", promoCode:"Kode promo", apply:"Pakai", checkout:"Lanjut ke Pembayaran", emptyCart:"Keranjang belanja masih kosong.",
    filters:"Filter", search:"Cari", category:"Kategori", color:"Warna", gender:"Gender", reset:"Reset filter", showing:"Menampilkan", sortBy:"Urutkan", popular:"Paling populer", newest:"Terbaru", lowHigh:"Harga terendah", highLow:"Harga tertinggi", noProducts:"Produk tidak ditemukan.",
    productDetails:"Detail Produk", reviews:"Ulasan", faqs:"Pertanyaan Umum", writeReview:"Tulis Ulasan", loadMore:"Muat lebih banyak", youMayLike:"Mungkin kamu suka",
    size:"Ukuran", selectedColor:"Warna", addToCart:"Tambah ke Keranjang", addedTitle:"Produk masuk ke keranjang", addedText:"Produk sudah ditambahkan dan siap dilanjutkan.", seeCart:"Lihat Keranjang", continueShopping:"Lanjut Belanja",
    customerAccount:"Akun Pelanggan", signIn:"Masuk", signUp:"Daftar", fullName:"Nama lengkap", email:"Email", password:"Kata sandi", remember:"Ingat saya", createAccount:"Buat akun", signInButton:"Masuk", signOut:"Keluar", signOutConfirm:"Yakin ingin keluar dari akun ini?", cancel:"Batal", saveChanges:"Simpan perubahan", loggedInAs:"Masuk sebagai", language:"Bahasa", indonesian:"Bahasa Indonesia", english:"English", noAccount:"Belum punya akun?", haveAccount:"Sudah punya akun?", invalidLogin:"Email atau kata sandi tidak sesuai.", accountSaved:"Perubahan akun berhasil disimpan.", accountCreated:"Akun berhasil dibuat.",
    checkoutTitle:"Pembayaran", paymentTest:"Pembayaran masih dalam mode demo. Tidak ada tagihan nyata.", customerDetails:"Data pelanggan", phone:"Nomor telepon", address:"Alamat pengiriman", paymentMethod:"Metode pembayaran", card:"Kartu", bank:"Transfer bank", ewallet:"Dompet digital", placeOrder:"Bayar sekarang", processing:"Memproses", receipt:"Bukti pembayaran", paymentConfirmed:"Pembayaran dikonfirmasi", order:"Pesanan", emailReceipt:"Bukti pembayaran dikirim", pendingSetup:"Belum diatur", nothingCheckout:"Belum ada barang untuk dibayar", backShop:"Kembali ke belanja",
    sourceNote:"Sumber foto: Pexels. Detail bahan dan produksi perlu dikonfirmasi ke pemasok.",
  },
  en: {
    home:"Home", shop:"Shop", about:"About", contact:"Contact", account:"Account", cart:"Cart",
    sale:"Sale", newArrivals:"New Arrivals", brands:"Collections", shopNow:"Shop Now", viewAll:"View All",
    timeless:"Timeless style, made to be worn longer", heroText:"A considered collection for people who value quality, comfort, and understated style.",
    internationalBrands:"Selected labels", qualityProducts:"Quality products", happyCustomers:"Happy customers", newCollection:"New collection 2026",
    browseStyle:"Browse by style", casual:"Casual", formal:"Formal", party:"Party", gym:"Active",
    topSelling:"Most Loved", happyReviews:"Customer Stories", signupBanner:"Sign up and get 10% off your first order.", signup:"Sign up now",
    latestOffers:"Stay up to date with new offers", emailPlaceholder:"Enter your email address", subscribe:"Subscribe", subscribed:"Subscribed",
    orderSummary:"Order Summary", subtotal:"Subtotal", productDiscounts:"Product discounts", delivery:"Delivery", free:"Free", total:"Total", promoCode:"Promo code", apply:"Apply", checkout:"Continue to Checkout", emptyCart:"Your shopping cart is empty.",
    filters:"Filters", search:"Search", category:"Category", color:"Color", gender:"Gender", reset:"Reset filters", showing:"Showing", sortBy:"Sort by", popular:"Most popular", newest:"Newest", lowHigh:"Price: low to high", highLow:"Price: high to low", noProducts:"No products match those filters.",
    productDetails:"Product Details", reviews:"Reviews", faqs:"FAQs", writeReview:"Write a Review", loadMore:"Load more", youMayLike:"You might also like",
    size:"Size", selectedColor:"Color", addToCart:"Add to Cart", addedTitle:"Product added to cart", addedText:"The product is in your cart and ready for checkout.", seeCart:"View Cart", continueShopping:"Continue Shopping",
    customerAccount:"Customer Account", signIn:"Sign in", signUp:"Sign up", fullName:"Full name", email:"Email", password:"Password", remember:"Remember me", createAccount:"Create account", signInButton:"Sign in", signOut:"Sign out", signOutConfirm:"Are you sure you want to sign out?", cancel:"Cancel", saveChanges:"Save changes", loggedInAs:"Signed in as", language:"Language", indonesian:"Bahasa Indonesia", english:"English", noAccount:"Don't have an account?", haveAccount:"Already have an account?", invalidLogin:"Email or password is incorrect.", accountSaved:"Account changes saved.", accountCreated:"Account created.",
    checkoutTitle:"Checkout", paymentTest:"Payment is in demo mode. No real charge is made.", customerDetails:"Customer details", phone:"Phone", address:"Shipping address", paymentMethod:"Payment method", card:"Card", bank:"Bank transfer", ewallet:"Digital wallet", placeOrder:"Pay now", processing:"Processing", receipt:"Payment receipt", paymentConfirmed:"Payment confirmed", order:"Order", emailReceipt:"Receipt email", pendingSetup:"Not configured", nothingCheckout:"There are no items to checkout", backShop:"Back to shop",
    sourceNote:"Photo source: Pexels. Fabric and production details should be confirmed with the supplier.",
  }
};

const Context = createContext<I18nContext | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("id");
  useEffect(() => { document.documentElement.lang=lang; }, [lang]);
  useEffect(() => { const stored = localStorage.getItem("merx_language") as Lang | null; if (stored === "id" || stored === "en") setLangState(stored); }, []);
  const setLang = (next: Lang) => { setLangState(next); localStorage.setItem("merx_language", next); };
  const value = useMemo(() => ({ lang, setLang, t: (key: string) => translations[lang][key] ?? key }), [lang]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useI18n() { const ctx = useContext(Context); if (!ctx) throw new Error("useI18n must be used inside I18nProvider"); return ctx; }
