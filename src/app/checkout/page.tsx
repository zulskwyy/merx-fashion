"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/lib/hooks/redux";
import { clearCart } from "@/lib/features/carts/cartsSlice";
import { RootState } from "@/lib/store";
import { calculateTax, discountedPrice, formatIDR, getCartSubtotal, getCartTotal, getCartTax, resolveTaxRate } from "@/lib/catalog";
import { products } from "@/data/products";
import { useI18n } from "@/lib/i18n";
import { useStoreSettings } from "@/lib/store-settings";

const KEY = "merx_customer";

export default function CheckoutPage() {
  const { t, lang } = useI18n();
  const settings = useStoreSettings();
  const dispatch = useAppDispatch();
  const items = useAppSelector((s: RootState) => s.carts.cart?.items ?? []);
  const subtotal = useMemo(() => getCartSubtotal(items), [items]);
  const merchandiseTotal = useMemo(() => getCartTotal(items), [items]);
  const productDiscount = Math.max(0, subtotal - merchandiseTotal);
  const shippingFee = Math.max(0, Number(settings.commerceSettings.shippingFee || 0));
  const taxRate = Math.max(0, Number(settings.commerceSettings.taxRate || 0));
  const taxTotal = useMemo(() => getCartTax(items, taxRate), [items, taxRate]);
  const grandTotal = merchandiseTotal + shippingFee + taxTotal;

  const [account, setAccount] = useState<any>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [payment, setPayment] = useState("card");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<any>(null);

  useEffect(() => {
    try {
      const v = JSON.parse(localStorage.getItem(KEY) || "null");
      if (v) {
        setAccount(v);
        setName(v.name || "");
        setEmail(v.email || "");
      }
    } catch {}
  }, []);

  if (!items.length && !done) {
    return <main className="mx-auto max-w-xl px-4 py-20 text-center"><h1 className="mb-4 text-3xl font-bold">{t("nothingCheckout")}</h1><Button asChild className="bg-[#1B2A4A]"><Link href="/shop">{t("backShop")}</Link></Button></main>;
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: { name, email, phone, address },
          items,
          payment,
          lang,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout failed");
      setDone({ ...data, name, email, address, items, payment, subtotal, productDiscount, merchandiseTotal, shippingFee: data.shippingFee ?? shippingFee, taxTotal: data.taxTotal ?? taxTotal, total: data.total ?? grandTotal, taxBreakdown: data.taxBreakdown || [] });
      dispatch(clearCart());
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Checkout failed");
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return <main className="mx-auto max-w-2xl px-4 py-16"><div className="rounded-3xl border border-black/10 bg-white p-7 text-center shadow-sm"><h1 className="text-3xl font-bold">{t("paymentConfirmed")}</h1><p className="mt-2 text-black/60">{t("order")} <b>{done.orderId}</b></p><div className="mt-6 rounded-2xl bg-[#F3EFE7] p-5 text-left"><p className="mb-4 font-semibold">{t("receipt")}</p><div className="space-y-2 text-sm"><div className="flex justify-between"><span>{t("subtotal")}</span><b>{formatIDR(done.merchandiseTotal)}</b></div><div className="flex justify-between"><span>{t("productDiscounts")}</span><b className="text-red-700">-{formatIDR(done.productDiscount)}</b></div><div className="flex justify-between"><span>{t("delivery")}</span><b>{done.shippingFee ? formatIDR(done.shippingFee) : t("free")}</b></div><div className="flex justify-between"><span>{t("tax")}</span><b>{formatIDR(done.taxTotal)}</b></div><div className="flex justify-between border-t border-black/10 pt-3 text-lg"><span>{t("total")}</span><b>{formatIDR(done.total)}</b></div></div><p className="mt-4 text-xs leading-5 text-black/45">{t("taxNote")}</p><div className="mt-5 border-t border-black/10 pt-4 space-y-3">{done.items.map((i:any) => { const p=products.find((x)=>x.id===i.id); const img=i.srcUrl||p?.srcUrl||"/images/dress-style-2.png"; return <div key={`${i.id}-${i.attributes.join("-")}`} className="flex items-center gap-3"><img src={img} alt={i.name} className="h-16 w-16 rounded-lg bg-white object-cover"/><div className="text-sm"><p className="font-medium">{i.name}</p><p className="text-black/50">{i.attributes.join(" / ")} · {i.quantity} × {formatIDR(discountedPrice(i))}</p></div></div>; })}</div></div><div className="mt-6 grid gap-3 sm:grid-cols-2"><Button asChild className="bg-[#1B2A4A]"><Link href="/shop">{t("continueShopping")}</Link></Button><Button asChild variant="outline"><Link href="/account">{t("account")}</Link></Button></div></div></main>;
  }

  return <main className="pb-24"><div className="mx-auto max-w-5xl px-4"><div className="flex items-center gap-2 py-5 text-sm text-black/50"><Link href="/">{t("home")}</Link><span>/</span><span>{t("checkoutTitle")}</span></div><h1 className="mb-2 text-3xl font-bold md:text-4xl">{t("checkoutTitle")}</h1><p className="mb-8 text-black/60">{t("paymentTest")}</p><form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1.25fr_.75fr]"><section className="space-y-5 rounded-2xl border border-black/10 bg-white p-6"><div><h2 className="mb-4 text-xl font-bold">{t("customerDetails")}</h2><div className="grid gap-4 sm:grid-cols-2"><input required value={name} onChange={e=>setName(e.target.value)} placeholder={t("fullName")} className="rounded-xl border border-black/10 px-4 py-3"/><input required type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder={t("email")} className="rounded-xl border border-black/10 px-4 py-3"/></div></div><input value={phone} onChange={e=>setPhone(e.target.value)} placeholder={t("phone")} className="w-full rounded-xl border border-black/10 px-4 py-3"/><textarea required value={address} onChange={e=>setAddress(e.target.value)} placeholder={t("address")} rows={4} className="w-full rounded-xl border border-black/10 px-4 py-3"/><div><h2 className="mb-4 text-xl font-bold">{t("paymentMethod")}</h2><div className="grid gap-3 sm:grid-cols-3">{[["card",t("card")],["bank",t("bank")],["ewallet",t("ewallet")]].map(([v,label])=><button key={v} type="button" onClick={()=>setPayment(v)} className={`rounded-xl border p-4 text-left transition ${payment===v?"border-[#1B2A4A] bg-[#F3EFE7]":"border-black/10 hover:bg-black/[.02]"}`}><b>{label}</b><div className="mt-1 text-xs text-black/50">Demo</div></button>)}</div></div><div className="rounded-xl border border-black/10 bg-[#faf8f4] p-4"><div className="flex items-center justify-between gap-3"><div><div className="font-semibold">{t("shippingAuto")}</div><div className="mt-1 text-xs text-black/50">{shippingFee ? t("shippingAutoHint") : t("free")}</div></div><b>{shippingFee ? formatIDR(shippingFee) : t("free")}</b></div></div><Button disabled={busy} className="h-14 w-full bg-[#1B2A4A]">{busy?t("processing"):t("placeOrder")} <span className="ml-1">{formatIDR(grandTotal)}</span></Button></section><aside className="h-fit rounded-2xl border border-black/10 bg-white p-6"><h2 className="mb-4 text-xl font-bold">{t("orderSummary")}</h2>{items.map(i=>{const p=products.find(x=>x.id===i.id);const img=i.srcUrl||p?.srcUrl||"/images/dress-style-2.png";return <div key={`${i.id}-${i.attributes.join("-")}`} className="flex gap-3 border-b border-black/10 py-3"><img src={img} alt={i.name} className="h-16 w-16 rounded-lg bg-[#F3EFE7] object-cover"/><div className="min-w-0 flex-1"><p className="line-clamp-2 text-sm font-medium">{i.name}</p><p className="mt-1 text-xs text-black/50">{i.attributes.join(" / ")} · {i.quantity}</p></div><b className="whitespace-nowrap text-sm">{formatIDR(discountedPrice(i))}</b></div>})}<div className="space-y-3 pt-4 text-sm"><div className="flex justify-between"><span className="text-black/60">{t("subtotal")}</span><b>{formatIDR(merchandiseTotal)}</b></div>{productDiscount>0&&<div className="flex justify-between"><span className="text-black/60">{t("productDiscounts")}</span><b className="text-red-700">-{formatIDR(productDiscount)}</b></div>}<div className="flex justify-between"><span className="text-black/60">{t("delivery")}</span><b>{shippingFee ? formatIDR(shippingFee) : t("free")}</b></div><div className="flex justify-between"><span className="text-black/60">{t("tax")}</span><b>{formatIDR(taxTotal)}</b></div><div className="flex justify-between border-t border-black/10 pt-3 text-lg"><span>{t("total")}</span><b>{formatIDR(grandTotal)}</b></div></div><p className="mt-4 text-xs leading-5 text-black/45">{t("taxNote")}</p>{account&&<p className="mt-4 text-xs text-black/50">{t("emailReceipt")}: {account.email}</p>}</aside></form></div></main>;
}
