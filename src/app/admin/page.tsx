"use client";

import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  Check,
  ChevronRight,
  CircleDollarSign,
  Copy,
  CheckCircle2,
  ExternalLink,
  Image as ImageIcon,
  Loader2,
  LogOut,
  Package,
  Percent,
  Plus,
  RefreshCw,
  Save,
  Send,
  ShoppingBag,
  Store,
  Trash2,
  TrendingUp,
  Upload,
  WalletCards,
  X,
} from "lucide-react";
import { calculateTax, formatIDR, resolveTaxRate } from "@/lib/catalog";
import { calculateBasePrice, discountedPrice, pricingSummary, type PricingMode } from "@/lib/admin-pricing";

type Discount = { amount?: number; percentage?: number; source?: "manual" | "auto" };
type Tax = { mode: "auto" | "manual"; rate?: number | null };
type Pricing = { mode: PricingMode; target: number };
type Product = {
  id: number;
  title: string;
  slug: string;
  src_url?: string;
  srcUrl?: string;
  gallery?: string[];
  price: number;
  discount: Discount;
  tax?: Tax;
  pricing?: Pricing;
  rating: number;
  review_count?: number;
  reviewCount?: number;
  category: string;
  gender: string;
  color: string;
  sizes: string[];
  description: string;
  details?: Record<string, string>;
  faqs?: any[];
  reviews?: any[];
  stock: number;
  cost_price?: number;
  costPrice?: number;
  is_active?: boolean;
  isActive?: boolean;
};

type Order = {
  id: number;
  order_code: string;
  customer_name: string;
  customer_email: string;
  phone?: string;
  address?: string;
  payment_method: string;
  status: string;
  total: number;
  cost_total: number;
  other_cost?: number;
  subtotal?: number;
  tax_total?: number;
  delivery_status?: "pending" | "delivered";
  delivered_at?: string | null;
  shipping?: {
    courier?: string;
    trackingNumber?: string;
    shippingFee?: number;
    shippingCost?: number;
    note?: string;
  };
  created_at: string;
  items?: any[];
};

type Analytics = {
  configured: boolean;
  revenue: number;
  cost: number;
  extraCost: number;
  taxTotal: number;
  profit: number;
  margin: number;
  orders: number;
  topCheckout: { id: number; title: string; count: number }[];
  topSaved: { id: number; title: string; count: number }[];
  lowStock: { id: number; title: string; stock: number }[];
};

type WalletTransaction = {
  id: number;
  direction: "credit" | "debit";
  transaction_type: string;
  amount: number;
  method?: string | null;
  destination?: string | null;
  note?: string | null;
  created_at: string;
};

type WalletData = {
  configured: boolean;
  balance: number;
  transactions: WalletTransaction[];
};

type Settings = {
  store_name?: string;
  storeName?: string;
  primary_color?: string;
  primaryColor?: string;
  accent_color?: string;
  accentColor?: string;
  hero_title?: string;
  heroTitle?: string;
  hero_description?: string;
  heroDescription?: string;
  hero_image_url?: string;
  heroImageUrl?: string;
  commerce_settings?: { shippingFee?: number; taxRate?: number };
  commerceSettings?: { shippingFee?: number; taxRate?: number };
  business?: {
    phone?: string;
    email?: string;
    whatsapp?: string;
    address?: string;
    instagram?: string;
    shippingNote?: string;
  };
};

const input = "w-full rounded-lg border border-black/10 bg-white px-4 py-3 outline-none transition focus:border-[#1B2A4A] focus:ring-2 focus:ring-[#1B2A4A]/10";
const card = "rounded-lg border border-black/10 bg-white shadow-[0_8px_35px_rgba(27,42,74,.05)]";
const statuses = ["paid", "processing", "packed", "ready_to_ship", "shipped", "delivered", "cancelled"];

export default function AdminPage() {
  const [session, setSession] = useState<any>(null);
  const [tab, setTab] = useState("dashboard");
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [settings, setSettings] = useState<Settings>({});
  const [discount, setDiscount] = useState<any>({ enabled: false, stockThreshold: 5, percentage: 10 });
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [editing, setEditing] = useState<Product | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  useEffect(() => {
    fetch("/api/admin/session").then((r) => r.json()).then(setSession).catch(() => setSession({ authenticated: false, configured: false }));
  }, []);

  const flash = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  };

  const refresh = async () => {
    setLoading(true);
    setError("");
    const requests = await Promise.allSettled([
      fetch("/api/admin/products").then(async (r) => ({ ok: r.ok, data: await r.json() })),
      fetch("/api/admin/orders").then(async (r) => ({ ok: r.ok, data: await r.json() })),
      fetch("/api/admin/analytics").then(async (r) => ({ ok: r.ok, data: await r.json() })),
      fetch("/api/admin/settings").then(async (r) => ({ ok: r.ok, data: await r.json() })),
      fetch("/api/admin/discounts").then(async (r) => ({ ok: r.ok, data: await r.json() })),
      fetch("/api/admin/wallet").then(async (r) => ({ ok: r.ok, data: await r.json() })),
    ]);
    const messages: string[] = [];
    const p = requests[0]; if (p.status === "fulfilled" && p.value.ok) setProducts(p.value.data); else messages.push("produk");
    const o = requests[1]; if (o.status === "fulfilled" && o.value.ok) setOrders(o.value.data); else messages.push("pesanan");
    const a = requests[2]; if (a.status === "fulfilled" && a.value.ok) setAnalytics(a.value.data); else messages.push("analitik");
    const s = requests[3]; if (s.status === "fulfilled" && s.value.ok) setSettings(s.value.data); else messages.push("pengaturan");
    const d = requests[4]; if (d.status === "fulfilled" && d.value.ok) setDiscount(d.value.data); else messages.push("diskon");
    const w = requests[5]; if (w.status === "fulfilled" && w.value.ok) setWallet(w.value.data); else messages.push("saldo");
    if (messages.length) setError(`Sebagian data gagal dimuat: ${messages.join(", ")}.`);
    setLoading(false);
  };

  useEffect(() => { if (session?.authenticated) refresh().catch(() => setError("Gagal memuat data admin.")); }, [session?.authenticated]);

  if (session === null) return <div className="min-h-screen grid place-items-center bg-[#f6f3ed] text-black/60">Memuat Admin Studio…</div>;
  if (!session.configured || !session.authenticated) return <AdminLogin configured={session.configured} onDone={() => fetch("/api/admin/session").then(r => r.json()).then(setSession)} />;

  const nav = [
    { id: "dashboard", label: "Ringkasan", icon: TrendingUp },
    { id: "products", label: "Produk & Stok", icon: Package },
    { id: "orders", label: "Pesanan & Kirim", icon: ShoppingBag },
    { id: "discounts", label: "Diskon", icon: Percent },
    { id: "settings", label: "Toko & Tampilan", icon: Store },
    { id: "wallet", label: "Keuangan & Saldo", icon: WalletCards },
  ];

  const saveProduct = async (product: Product) => {
    setSaving(true); setError("");
    try {
      const exists = products.some((x) => x.id === product.id);
      const res = await fetch("/api/admin/products", {
        method: exists ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan produk.");
      setEditing(null);
      await refresh();
      flash(exists ? "Produk diperbarui." : "Produk berhasil ditambahkan.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menyimpan produk.");
    } finally { setSaving(false); }
  };

  const duplicateProduct = async (source: Product) => {
    setSaving(true); setError("");
    try {
      const id = Math.max(0, ...products.map((x) => Number(x.id) || 0)) + 1;
      const copy = { ...source, id, title: `${source.title} (Copy)`, slug: `${source.slug || "produk"}-copy-${id}` };
      const res = await fetch("/api/admin/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(copy) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menduplikasi produk.");
      await refresh();
      flash("Produk berhasil diduplikasi.");
    } catch (e) { setError(e instanceof Error ? e.message : "Gagal menduplikasi produk."); }
    finally { setSaving(false); }
  };

  const deleteProduct = async (id: number) => {
    if (!window.confirm("Hapus produk ini dari katalog?")) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/products", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menghapus produk.");
      await refresh(); flash("Produk dihapus.");
    } catch (e) { setError(e instanceof Error ? e.message : "Gagal menghapus produk."); }
    finally { setSaving(false); }
  };

  const saveDiscount = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/discounts", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(discount) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan aturan diskon.");
      setDiscount(data); await refresh(); flash("Aturan diskon tersimpan.");
    } catch (e) { setError(e instanceof Error ? e.message : "Gagal menyimpan diskon."); }
    finally { setSaving(false); }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const b = settings.business || {};
      const payload = {
        storeName: settings.storeName || settings.store_name,
        primaryColor: settings.primaryColor || settings.primary_color,
        accentColor: settings.accentColor || settings.accent_color,
        heroTitle: settings.heroTitle || settings.hero_title,
        heroDescription: settings.heroDescription || settings.hero_description,
        heroImageUrl: settings.heroImageUrl || settings.hero_image_url,
        commerceSettings: {
          shippingFee: Number(settings.commerceSettings?.shippingFee ?? settings.commerce_settings?.shippingFee ?? 0),
          taxRate: Number(settings.commerceSettings?.taxRate ?? settings.commerce_settings?.taxRate ?? 11),
        },
        business: b,
      };
      const res = await fetch("/api/admin/settings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan pengaturan.");
      setSettings(data?.[0] || data); flash("Pengaturan toko tersimpan.");
    } catch (e) { setError(e instanceof Error ? e.message : "Gagal menyimpan pengaturan."); }
    finally { setSaving(false); }
  };

  const updateOrder = async (id: number, patch: Partial<Order>) => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/orders", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, ...patch }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal memperbarui pesanan.");
      await refresh();
      setSelectedOrder((current) => current ? { ...current, ...patch } : current);
      flash("Pesanan diperbarui.");
    } catch (e) { setError(e instanceof Error ? e.message : "Gagal memperbarui pesanan."); }
    finally { setSaving(false); }
  };

  const logout = async () => { await fetch("/api/admin/logout", { method: "POST" }); location.reload(); };
  const lowStock = products.filter((p) => Number(p.stock || 0) <= 5).sort((a, b) => a.stock - b.stock).slice(0, 8);

  return (
    <div className="min-h-screen bg-[#f6f3ed] text-[#1B2A4A]">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 shrink-0 border-r border-black/10 bg-white p-6 lg:flex lg:flex-col">
          <Brand />
          <nav className="space-y-1">
            {nav.map((item) => <NavButton key={item.id} active={tab === item.id} item={item} onClick={() => setTab(item.id)} />)}
          </nav>
          <div className="mt-auto border-t border-black/10 pt-5">
            <div className="text-xs text-black/40">ADMIN</div>
            <div className="mt-1 truncate text-sm font-medium">{session.email}</div>
            <button onClick={logout} className="mt-4 inline-flex items-center gap-2 text-sm text-black/60 transition hover:text-black"><LogOut size={16} /> Keluar</button>
          </div>
        </aside>

        <main className="w-full min-w-0">
          <header className="sticky top-0 z-30 border-b border-black/10 bg-white/90 px-4 py-3 backdrop-blur lg:px-8">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold lg:hidden">MERX Admin Studio</div>
                <div className="hidden text-sm text-black/50 lg:block">Kelola katalog, harga, laba, stok, pesanan, dan pengiriman.</div>
              </div>
              <div className="flex items-center gap-2">
                <AnimatedButton variant="ghost" onClick={() => refresh()} disabled={loading} title="Muat ulang data"><RefreshCw size={17} className={loading ? "animate-spin" : ""} /></AnimatedButton>
                <a href="/" className="hidden items-center gap-1 rounded-xl px-3 py-2 text-sm font-medium transition hover:bg-[#f5f1e9] sm:inline-flex">Lihat toko <ExternalLink size={15} /></a>
              </div>
            </div>
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1 lg:hidden">
              {nav.map((item) => <NavButton key={item.id} compact active={tab === item.id} item={item} onClick={() => setTab(item.id)} />)}
            </div>
          </header>

          <div className="px-4 py-6 lg:px-8 lg:py-8">
            <AnimatePresence>{error && <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="mb-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"><AlertTriangle size={18} className="mt-0.5 shrink-0" /><div className="flex-1">{error}</div><button onClick={() => setError("")}><X size={16} /></button></motion.div>}</AnimatePresence>

            <AnimatePresence mode="wait">
              {tab === "dashboard" && <motion.div key="dashboard" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}><Dashboard analytics={analytics} products={products} lowStock={lowStock} orders={orders} wallet={wallet} /></motion.div>}
              {tab === "products" && <motion.div key="products" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}><Products products={products} onAdd={() => setEditing(blankProduct(products))} onEdit={setEditing} onDelete={deleteProduct} onDuplicate={duplicateProduct} /></motion.div>}
              {tab === "orders" && <motion.div key="orders" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}><Orders orders={orders} onOpen={setSelectedOrder} /></motion.div>}
              {tab === "discounts" && <motion.div key="discounts" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}><Discounts value={discount} setValue={setDiscount} onSave={saveDiscount} saving={saving} /></motion.div>}
              {tab === "settings" && <motion.div key="settings" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}><StoreSettings value={settings} setValue={setSettings} onSave={saveSettings} saving={saving} /></motion.div>}
              {tab === "wallet" && <motion.div key="wallet" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}><Wallet /></motion.div>}
            </AnimatePresence>
          </div>
        </main>
      </div>

      <AnimatePresence>{editing && <ProductEditor product={editing} defaultTaxRate={Number(settings.commerceSettings?.taxRate ?? settings.commerce_settings?.taxRate ?? 11)} saving={saving} onClose={() => { setEditing(null); setError(""); }} onSave={saveProduct} />}</AnimatePresence>
      <AnimatePresence>{selectedOrder && <OrderDrawer order={selectedOrder} saving={saving} onClose={() => setSelectedOrder(null)} onSave={updateOrder} />}</AnimatePresence>
      <AnimatePresence>{toast && <motion.div initial={{ opacity: 0, y: 20, scale: .97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20 }} className="fixed bottom-5 left-1/2 z-[80] -translate-x-1/2 rounded-full bg-[#1B2A4A] px-5 py-3 text-sm font-medium text-white shadow-xl"><Check size={16} className="mr-2 inline" />{toast}</motion.div>}</AnimatePresence>
    </div>
  );
}

function Brand() { return <div className="mb-10"><div className="text-2xl font-black tracking-tight">MERX</div><div className="mt-1 text-xs uppercase tracking-[0.25em] text-black/40">Admin Studio</div></div>; }
function NavButton({ item, active, onClick, compact = false }: any) { const Icon = item.icon; return <motion.button whileHover={{ x: 2 }} whileTap={{ scale: .98 }} onClick={onClick} className={`flex shrink-0 items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${compact ? "bg-white border border-black/10" : "w-full px-4 py-3"} ${active ? "bg-[#1B2A4A] text-white" : "text-black/65 hover:bg-[#f5f1e9]"}`}><Icon size={17} />{item.label}</motion.button>; }
function AnimatedButton({ children, variant = "primary", className = "", ...props }: any) { return <motion.button whileHover={{ scale: 1.015 }} whileTap={{ scale: .97 }} transition={{ type: "spring", stiffness: 420, damping: 22 }} className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition ${variant === "primary" ? "bg-[#1B2A4A] text-white shadow-sm hover:bg-[#16233e]" : variant === "danger" ? "border border-red-200 bg-white text-red-700 hover:bg-red-50" : "border border-black/10 bg-white text-[#1B2A4A] hover:bg-[#f7f4ed]"} ${className}`} {...props}>{children}</motion.button>; }

function AdminLogin({ configured, onDone }: { configured: boolean; onDone: () => void }) {
  const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => { e.preventDefault(); setBusy(true); setError(""); try { const r = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) }); const d = await r.json(); if (!r.ok) throw new Error(d.error || "Gagal masuk."); onDone(); } catch (e) { setError(e instanceof Error ? e.message : "Gagal masuk."); } finally { setBusy(false); } };
  return <main className="min-h-screen bg-[#f6f3ed] grid place-items-center px-4"><motion.form initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .35 }} onSubmit={submit} className={`${card} w-full max-w-md p-7`}><div className="text-3xl font-black">MERX</div><div className="mt-1 text-sm text-black/50">Admin Studio</div>{!configured && <div className="mt-6 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">Credential admin belum dikonfigurasi di Vercel.</div>}<label className="mt-6 block text-sm">Email<input required type="email" className={`${input} mt-2`} value={email} onChange={e => setEmail(e.target.value)} /></label><label className="mt-4 block text-sm">Kata sandi<input required type="password" className={`${input} mt-2`} value={password} onChange={e => setPassword(e.target.value)} /></label><AnimatedButton type="submit" disabled={!configured || busy} className="mt-6 h-12 w-full">{busy ? <Loader2 size={17} className="animate-spin" /> : null}{busy ? "Memeriksa…" : "Masuk ke Admin"}</AnimatedButton>{error && <p className="mt-4 text-sm text-red-700">{error}</p>}</motion.form></main>;
}

function Dashboard({ analytics, products, lowStock, orders, wallet }: { analytics: Analytics | null; products: Product[]; lowStock: Product[]; orders: Order[]; wallet: WalletData | null }) {
  const awaiting = orders.filter(o => ["paid", "processing", "packed", "ready_to_ship"].includes(o.status)).length;
  const revenue = analytics?.revenue || 0;
  const cost = analytics?.cost || 0;
  const profit = analytics?.profit || 0;
  const transactions = wallet?.transactions || [];
  const todayKey = new Date().toLocaleDateString("en-CA");
  const todayCredits = transactions
    .filter(tx => tx.direction === "credit" && new Date(tx.created_at).toLocaleDateString("en-CA") === todayKey)
    .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
  const todayWithdrawals = transactions
    .filter(tx => tx.direction === "debit" && new Date(tx.created_at).toLocaleDateString("en-CA") === todayKey)
    .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
  const activeProducts = products.filter(p => p.is_active !== false && p.isActive !== false).length;
  const currentBalance = wallet?.balance || 0;

  return <div>
    <PageHeader
      eyebrow="DASHBOARD"
      title="Kontrol toko"
      text="Pisahkan jelas uang yang masih tersedia dari kinerja penjualan, supaya angka tidak tercampur."
    />

    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: .35, ease: "easeOut" }}
      className="overflow-hidden rounded-xl border border-[#17233d] bg-[#1B2A4A] text-white shadow-[0_18px_45px_rgba(27,42,74,.16)]"
    >
      <div className="grid lg:grid-cols-[1.25fr_1fr]">
        <div className="p-6 sm:p-8">
          <div className="flex items-center justify-between gap-4">
            <div className="text-xs uppercase tracking-[.22em] text-white/55">KAS & SALDO</div>
            <WalletCards size={19} className="text-white/55" />
          </div>
          <div className="mt-6 text-sm text-white/65">Saldo siap ditarik</div>
          <div className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">{formatIDR(currentBalance)}</div>
          <div className="mt-4 max-w-xl text-sm leading-6 text-white/60">
            Ini adalah saldo internal MERX saat ini. Angkanya sudah berkurang setiap kali kamu mencatat penarikan.
            <span className="text-white/80"> Saldo ini berbeda dari omzet.</span>
          </div>
        </div>
        <div className="grid grid-cols-2 border-t border-white/10 lg:border-l lg:border-t-0">
          <motion.div whileHover={{ backgroundColor: "rgba(255,255,255,.045)" }} className="p-6 sm:p-8">
            <div className="text-xs uppercase tracking-[.16em] text-white/45">Kas masuk hari ini</div>
            <div className="mt-3 text-2xl font-semibold">{formatIDR(todayCredits)}</div>
            <div className="mt-2 text-xs text-white/45">Pembayaran yang tercatat hari ini</div>
          </motion.div>
          <motion.div whileHover={{ backgroundColor: "rgba(255,255,255,.045)" }} className="border-l border-white/10 p-6 sm:p-8">
            <div className="text-xs uppercase tracking-[.16em] text-white/45">Keluar hari ini</div>
            <div className="mt-3 text-2xl font-semibold">{formatIDR(todayWithdrawals)}</div>
            <div className="mt-2 text-xs text-white/45">Penarikan yang dicatat hari ini</div>
          </motion.div>
        </div>
      </div>
    </motion.section>

    <section className="mt-8">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-[.2em] text-black/35">KINERJA PENJUALAN</div>
          <h2 className="mt-1 text-xl font-semibold tracking-tight">Angka akumulasi</h2>
        </div>
        <div className="hidden text-right text-xs text-black/40 sm:block">Berdasarkan order yang tersimpan di sistem</div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric title="Omzet penjualan" value={formatIDR(revenue)} icon={<CircleDollarSign size={18} />} />
        <Metric title="Pajak tercatat" value={formatIDR(analytics?.taxTotal || 0)} icon={<Percent size={18} />} />
        <Metric title="Modal barang" value={formatIDR(cost)} icon={<Package size={18} />} />
        <Metric title="Laba setelah pajak" value={formatIDR(profit)} icon={<TrendingUp size={18} />} positive={profit >= 0} />
      </div>
      <div className="mt-4 flex items-start gap-3 rounded-xl border border-black/10 bg-[#faf8f4] px-4 py-3 text-sm text-black/55">
        <CircleDollarSign size={17} className="mt-0.5 shrink-0 text-black/35" />
        <p><b className="text-[#1B2A4A]">Omzet</b> adalah total nilai penjualan yang tercatat. <b className="text-[#1B2A4A]">Saldo</b> adalah uang internal yang masih tersisa setelah penarikan. Jadi saldo Rp0 tidak menghapus riwayat omzet.</p>
      </div>
    </section>

    <section className="mt-8">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-[.2em] text-black/35">OPERASIONAL</div>
          <h2 className="mt-1 text-xl font-semibold tracking-tight">Yang perlu diperhatikan</h2>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <motion.div whileHover={{ y: -2 }} transition={{ type: "spring", stiffness: 320, damping: 24 }} className={`${card} p-5`}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-[.14em] text-black/40">Pesanan aktif</div>
              <div className="mt-2 text-3xl font-semibold">{awaiting}</div>
              <div className="mt-2 text-sm text-black/50">Pesanan yang masih berada di alur pembayaran hingga siap kirim.</div>
            </div>
            <Send size={19} className="text-black/30" />
          </div>
        </motion.div>
        <motion.div whileHover={{ y: -2 }} transition={{ type: "spring", stiffness: 320, damping: 24 }} className={`${card} p-5`}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-[.14em] text-black/40">Produk aktif</div>
              <div className="mt-2 text-3xl font-semibold">{activeProducts}</div>
              <div className="mt-2 text-sm text-black/50">Dari {products.length} produk yang tercatat di database.</div>
            </div>
            <Package size={19} className="text-black/30" />
          </div>
        </motion.div>
      </div>
    </section>

    <div className="mt-8 grid gap-6 xl:grid-cols-2">
      <Panel title="Produk paling banyak checkout">{analytics?.topCheckout?.length ? <ol className="space-y-3">{analytics.topCheckout.slice(0, 8).map((x, i) => <motion.li layout key={x.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * .025 }} className="flex items-center justify-between border-b border-black/5 pb-3 last:border-0"><span><b className="mr-3 text-black/25">{String(i + 1).padStart(2, "0")}</b>{x.title}</span><span className="text-sm font-medium">{x.count} item</span></motion.li>)}</ol> : <Empty text="Belum ada checkout." />}</Panel>
      <Panel title="Produk yang sering disimpan">{analytics?.topSaved?.length ? <ol className="space-y-3">{analytics.topSaved.slice(0, 8).map((x, i) => <motion.li layout key={x.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * .025 }} className="flex items-center justify-between border-b border-black/5 pb-3 last:border-0"><span><b className="mr-3 text-black/25">{String(i + 1).padStart(2, "0")}</b>{x.title}</span><span className="text-sm font-medium">{x.count} simpan</span></motion.li>)}</ol> : <Empty text="Belum ada data simpan." />}</Panel>
    </div>

    <Panel title="Peringatan stok" className="mt-6">{lowStock.length ? <div className="grid gap-3 sm:grid-cols-2">{lowStock.map(p => <motion.div layout key={p.id} whileHover={{ y: -1 }} className="flex items-center justify-between rounded-lg bg-[#f6f3ed] p-4"><span className="truncate pr-4">{p.title}</span><b className={p.stock <= 0 ? "text-red-700" : "text-[#1B2A4A]"}>{p.stock} pcs</b></motion.div>)}</div> : <Empty text="Semua stok di atas batas aman." />}</Panel>
    <p className="mt-4 text-xs text-black/40">Jumlah produk aktif: {activeProducts} · Total order tersimpan: {orders.length}</p>
  </div>;
}

function Wallet() {
  const [data, setData] = useState<WalletData>({ configured: false, balance: 0, transactions: [] });
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("bank");
  const [destination, setDestination] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    const res = await fetch("/api/admin/wallet");
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Gagal memuat saldo.");
    setData(json);
  };

  useEffect(() => { load().catch((e) => setError(e instanceof Error ? e.message : "Gagal memuat saldo.")); }, []);

  const withdraw = async (full = false) => {
    setBusy(true);
    setError("");
    try {
      const value = full ? data.balance : Math.max(0, Math.round(Number(amount || 0)));
      if (!value) throw new Error("Saldo yang ditarik harus lebih dari 0.");
      const res = await fetch("/api/admin/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: value, method, destination, note }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Penarikan gagal.");
      setAmount("");
      await load();
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Penarikan gagal.");
    } finally {
      setBusy(false);
    }
  };

  const todayKey = new Date().toLocaleDateString("en-CA");
  const credits = data.transactions.filter((x) => x.direction === "credit").reduce((sum, x) => sum + Number(x.amount || 0), 0);
  const withdrawals = data.transactions.filter((x) => x.direction === "debit").reduce((sum, x) => sum + Number(x.amount || 0), 0);
  const todayCredits = data.transactions.filter((x) => x.direction === "credit" && new Date(x.created_at).toLocaleDateString("en-CA") === todayKey).reduce((sum, x) => sum + Number(x.amount || 0), 0);
  const todayWithdrawals = data.transactions.filter((x) => x.direction === "debit" && new Date(x.created_at).toLocaleDateString("en-CA") === todayKey).reduce((sum, x) => sum + Number(x.amount || 0), 0);

  return <div>
    <PageHeader
      eyebrow="KEUANGAN"
      title="Saldo & mutasi"
      text="Kelola saldo internal MERX tanpa mencampurnya dengan omzet akumulasi."
      action={<AnimatedButton variant="ghost" onClick={() => load().catch((e) => setError(e instanceof Error ? e.message : "Gagal memuat saldo."))}><RefreshCw size={16} /> Refresh</AnimatedButton>}
    />

    {error && <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</motion.div>}

    <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="overflow-hidden rounded-xl border border-[#17233d] bg-[#1B2A4A] text-white shadow-[0_18px_45px_rgba(27,42,74,.14)]">
      <div className="grid lg:grid-cols-[1.15fr_1fr]">
        <div className="p-6 sm:p-8">
          <div className="text-xs uppercase tracking-[.22em] text-white/55">SALDO SAAT INI</div>
          <div className="mt-5 text-sm text-white/65">Siap ditarik</div>
          <div className="mt-1 text-4xl font-semibold tracking-tight sm:text-5xl">{formatIDR(data.balance)}</div>
          <p className="mt-4 max-w-xl text-sm leading-6 text-white/60">Saldo ini adalah uang internal yang masih tersedia setelah seluruh penarikan yang dicatat. Riwayat transaksi tetap tersimpan walaupun saldo sekarang Rp0.</p>
        </div>
        <div className="grid grid-cols-2 border-t border-white/10 lg:border-l lg:border-t-0">
          <div className="p-6 sm:p-8"><div className="text-xs uppercase tracking-[.16em] text-white/45">Kas masuk hari ini</div><div className="mt-3 text-2xl font-semibold">{formatIDR(todayCredits)}</div><div className="mt-2 text-xs text-white/45">Mutasi kredit hari ini</div></div>
          <div className="border-l border-white/10 p-6 sm:p-8"><div className="text-xs uppercase tracking-[.16em] text-white/45">Keluar hari ini</div><div className="mt-3 text-2xl font-semibold">{formatIDR(todayWithdrawals)}</div><div className="mt-2 text-xs text-white/45">Mutasi debit hari ini</div></div>
        </div>
      </div>
    </motion.section>

    <section className="mt-8">
      <div className="mb-4"><div className="text-xs uppercase tracking-[.2em] text-black/35">RIWAYAT KEUANGAN</div><h2 className="mt-1 text-xl font-semibold tracking-tight">Akumulasi mutasi</h2></div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Metric title="Total uang masuk" value={formatIDR(credits)} icon={<CircleDollarSign size={18} />} />
        <Metric title="Total penarikan" value={formatIDR(withdrawals)} icon={<Send size={18} />} />
      </div>
      <div className="mt-4 rounded-xl border border-black/10 bg-[#faf8f4] px-4 py-3 text-sm text-black/55"><b className="text-[#1B2A4A]">Catatan:</b> angka akumulasi di bagian ini tidak berkurang saat kamu menarik saldo. Yang berkurang adalah <b className="text-[#1B2A4A]">saldo saat ini</b>.</div>
    </section>

    <div className="mt-8 grid gap-6 lg:grid-cols-[.9fr_1.1fr]">
      <section className={`${card} p-6`}>
        <div className="flex items-start justify-between gap-4"><div><div className="text-xs uppercase tracking-[.18em] text-black/40">TINDAKAN</div><h2 className="mt-2 text-xl font-semibold">Catat penarikan</h2></div><Send size={19} className="text-black/30" /></div>
        <p className="mt-3 text-sm leading-6 text-black/50">Gunakan ketika dana benar-benar kamu pindahkan ke bank, e-wallet, kas, atau tujuan lain. Sistem ini mencatat mutasi saldo internal MERX; tidak memindahkan uang secara otomatis.</p>
        <label className="mt-5 block text-sm">Jumlah penarikan<input className={`${input} mt-2`} type="number" min="1" max={data.balance || undefined} value={amount} onChange={(e) => setAmount(e.target.value)} placeholder={`Maks. ${formatIDR(data.balance)}`} /></label>
        <label className="mt-4 block text-sm">Media<select className={`${input} mt-2`} value={method} onChange={(e) => setMethod(e.target.value)}><option value="bank">Bank</option><option value="ewallet">E-Wallet</option><option value="cash">Kas / tunai</option><option value="other">Lainnya</option></select></label>
        <label className="mt-4 block text-sm">Tujuan<input className={`${input} mt-2`} value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="Contoh: BCA ****1234 / DANA 08xx" /></label>
        <label className="mt-4 block text-sm">Catatan<textarea className={`${input} mt-2 min-h-24`} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Keterangan penarikan" /></label>
        <div className="mt-5 flex flex-wrap gap-2"><AnimatedButton onClick={() => withdraw(false)} disabled={busy || !data.balance}>{busy ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />} {busy ? "Menyimpan…" : "Catat penarikan"}</AnimatedButton><AnimatedButton variant="ghost" onClick={() => withdraw(true)} disabled={busy || !data.balance}>Catat semua {formatIDR(data.balance)}</AnimatedButton></div>
      </section>

      <section className={`${card} p-6`}>
        <div className="flex items-start justify-between gap-4"><div><div className="text-xs uppercase tracking-[.18em] text-black/40">MUTASI TERBARU</div><h2 className="mt-2 text-xl font-semibold">Riwayat saldo</h2></div><WalletCards size={19} className="text-black/30" /></div>
        <div className="mt-5 space-y-2">
          {!data.transactions.length && <Empty text="Belum ada mutasi saldo." />}
          {data.transactions.map((tx) => <motion.div layout key={tx.id} whileHover={{ x: 2 }} className="flex items-start justify-between gap-4 rounded-lg border border-black/5 px-4 py-3"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2 font-medium"><span>{tx.transaction_type === "sale" ? "Pembayaran order" : tx.transaction_type === "withdrawal" ? "Penarikan saldo" : tx.transaction_type}</span><span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${tx.direction === "credit" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>{tx.direction === "credit" ? "MASUK" : "KELUAR"}</span></div><div className="mt-1 truncate text-xs text-black/45">{tx.method || ""}{tx.destination ? ` · ${tx.destination}` : ""} · {new Date(tx.created_at).toLocaleString("id-ID")}</div>{tx.note && <div className="mt-1 text-xs text-black/45">{tx.note}</div>}</div><b className={tx.direction === "credit" ? "shrink-0 text-emerald-700" : "shrink-0 text-red-700"}>{tx.direction === "credit" ? "+" : "-"}{formatIDR(tx.amount)}</b></motion.div>)}
        </div>
      </section>
    </div>
  </div>;
}

function Products({ products, onAdd, onEdit, onDelete, onDuplicate }: { products: Product[]; onAdd: () => void; onEdit: (p: Product) => void; onDelete: (id: number) => void; onDuplicate: (p: Product) => void }) {
  const [q, setQ] = useState(""); const [status, setStatus] = useState("all");
  const list = useMemo(() => products.filter(p => { const h = `${p.title} ${p.category} ${p.color} ${p.gender}`.toLowerCase(); return h.includes(q.toLowerCase()) && (status === "all" || (status === "active" ? p.is_active !== false && p.isActive !== false : p.is_active === false || p.isActive === false)); }).slice(0, 200), [products, q, status]);
  return <div><PageHeader eyebrow="KATALOG" title="Produk & stok" text={`${products.length} produk tersedia di database.`} action={<AnimatedButton onClick={onAdd}><Plus size={17} /> Produk baru</AnimatedButton>} />
    <div className="mb-5 flex flex-col gap-3 md:flex-row"><input className={input + " max-w-xl"} placeholder="Cari nama, kategori, warna…" value={q} onChange={e => setQ(e.target.value)} /><select className={input + " md:w-44"} value={status} onChange={e => setStatus(e.target.value)}><option value="all">Semua status</option><option value="active">Aktif</option><option value="inactive">Nonaktif</option></select></div>
    <div className={`${card} overflow-hidden`}><div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-[#faf8f4] text-left text-black/45"><tr><th className="p-4">Produk</th><th>Harga</th><th>Modal</th><th>Harga promo</th><th>Laba</th><th>Stok</th><th>Status</th><th></th></tr></thead><tbody><AnimatePresence initial={false}>{list.map((p) => { const img = p.src_url || p.srcUrl || p.gallery?.[0] || "/images/header-homepage.png"; const c = Number(p.cost_price ?? p.costPrice ?? 0); const fp = discountedPrice(Number(p.price || 0), p.discount); const profit = fp - c; return <motion.tr layout key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="border-t border-black/5 align-middle"><td className="min-w-[320px] p-4"><div className="flex items-center gap-3"><img src={img} onError={e => { e.currentTarget.src = "/images/header-homepage.png"; }} className="h-14 w-14 rounded-xl object-cover bg-[#f3efe7]" alt="" /><div><div className="font-medium">{p.title}</div><div className="mt-1 text-xs text-black/45">{p.category} · {p.color} · {p.sizes?.join("/")}</div></div></div></td><td>{formatIDR(p.price)}</td><td>{formatIDR(c)}</td><td>{formatIDR(fp)}{Number(p.discount?.percentage || 0) > 0 && <span className="ml-1 text-xs text-red-700">-{p.discount.percentage}%</span>}</td><td className={profit >= 0 ? "font-medium" : "font-medium text-red-700"}>{formatIDR(profit)}</td><td><span className={p.stock <= 5 ? "font-semibold text-red-700" : "font-medium"}>{p.stock}</span></td><td><span className={`rounded-full px-2.5 py-1 text-xs ${p.is_active === false || p.isActive === false ? "bg-black/5 text-black/45" : "bg-emerald-50 text-emerald-700"}`}>{p.is_active === false || p.isActive === false ? "Nonaktif" : "Aktif"}</span></td><td className="pr-4"><div className="flex justify-end gap-2"><AnimatedButton variant="ghost" className="px-3 py-2" onClick={() => onDuplicate(p)} title="Duplikat produk"><Copy size={15} /> <span className="hidden xl:inline">Duplikat</span></AnimatedButton><AnimatedButton variant="ghost" className="px-3 py-2" onClick={() => onEdit(p)}>Edit</AnimatedButton><AnimatedButton variant="danger" className="px-3 py-2" onClick={() => onDelete(p.id)}><Trash2 size={15} /></AnimatedButton></div></td></motion.tr>; })}</AnimatePresence></tbody></table></div></div>
  </div>;
}

function deliveryReceived(order: Order) { return order.delivery_status === "delivered" || order.status === "delivered"; }

function Orders({ orders, onOpen }: { orders: Order[]; onOpen: (o: Order) => void }) {
  const [filter, setFilter] = useState("all");
  const filtered = orders.filter(o => filter === "all" || (filter === "delivered" ? deliveryReceived(o) : filter === "pending" ? !deliveryReceived(o) && o.status !== "cancelled" : o.status === "cancelled"));
  const pending = orders.filter(o => !deliveryReceived(o) && o.status !== "cancelled").length;
  const delivered = orders.filter(o => deliveryReceived(o)).length;
  return <div><PageHeader eyebrow="PENERIMAAN" title="Pesanan & penerimaan" text="Di bagian ini kamu hanya perlu melihat satu hal: apakah pesanan sudah sampai ke customer atau belum. Ongkir sudah dicatat saat checkout." />
    <div className="mb-5 grid grid-cols-3 gap-3 sm:max-w-xl"><SummaryTile label="Semua pesanan" value={String(orders.length)} /><SummaryTile label="Belum sampai" value={String(pending)} positive={pending === 0} /><SummaryTile label="Sudah sampai" value={String(delivered)} /></div>
    <div className="mb-5 flex gap-2 overflow-x-auto">{[["all","Semua"],["pending","Belum sampai"],["delivered","Sudah sampai"],["cancelled","Dibatalkan"]].map(([v,label]) => <button key={v} onClick={() => setFilter(v)} className={`shrink-0 rounded-xl border px-4 py-2.5 text-sm transition ${filter === v ? "border-[#1B2A4A] bg-[#1B2A4A] text-white" : "border-black/10 bg-white text-black/55 hover:bg-[#f7f4ed]"}`}>{label}</button>)}</div>
    <div className={`${card} overflow-hidden`}><div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-[#faf8f4] text-left text-black/45"><tr><th className="p-4">Order</th><th>Pelanggan</th><th>Nilai dibayar</th><th>Sampai di customer</th><th>Tanggal</th><th></th></tr></thead><tbody>{filtered.map(o => <motion.tr layout key={o.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-t border-black/5"><td className="p-4 font-semibold">{o.order_code}</td><td>{o.customer_name}<div className="text-xs text-black/40">{o.customer_email}</div></td><td>{formatIDR(o.total)}</td><td><DeliveryBadge received={deliveryReceived(o)} /></td><td className="whitespace-nowrap">{new Date(o.created_at).toLocaleDateString("id-ID")}</td><td className="pr-4 text-right"><AnimatedButton variant="ghost" className="px-3 py-2" onClick={() => onOpen(o)}>Lihat <ChevronRight size={15} /></AnimatedButton></td></motion.tr>)}</tbody></table></div>{!filtered.length && <div className="p-8"><Empty text="Belum ada pesanan pada filter ini." /></div>}</div>
  </div>;
}

function OrderDrawer({ order, saving, onClose, onSave }: { order: Order; saving: boolean; onClose: () => void; onSave: (id: number, patch: Partial<Order>) => void }) {
  const [received, setReceived] = useState(deliveryReceived(order));
  const productSubtotal = Number(order.subtotal || Math.max(0, Number(order.total || 0) - Number(order.tax_total || 0) - Number(order.shipping?.shippingFee || 0)));
  const taxTotal = Number(order.tax_total || 0);
  const shippingFee = Number(order.shipping?.shippingFee || 0);
  const estimatedProfit = productSubtotal - taxTotal - Number(order.cost_total || 0) - Number(order.other_cost || 0);
  const saveDelivery = (next: boolean) => {
    setReceived(next);
    onSave(order.id, { delivery_status: next ? "delivered" : "pending", delivered_at: next ? new Date().toISOString() : null });
  };
  return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] bg-black/40 p-3 sm:p-6" onMouseDown={onClose}><motion.div initial={{ x: 60, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 60, opacity: 0 }} transition={{ type: "spring", stiffness: 320, damping: 28 }} className="ml-auto flex h-full w-full max-w-xl flex-col overflow-hidden rounded-3xl bg-white" onMouseDown={e => e.stopPropagation()}>
    <div className="flex items-center justify-between border-b border-black/10 px-5 py-4"><div><div className="font-semibold">{order.order_code}</div><div className="text-xs text-black/45">Status penerimaan customer</div></div><button onClick={onClose} className="rounded-lg p-2 transition hover:bg-black/5"><X size={18} /></button></div>
    <div className="flex-1 overflow-y-auto space-y-6 p-5">
      <section className={`${card} overflow-hidden`}><div className="border-b border-black/10 p-5"><div className="text-xs uppercase tracking-[.16em] text-black/40">Penerimaan</div><div className="mt-2 flex items-center gap-3"><DeliveryBadge received={received} /><div className="text-sm text-black/50">{received ? "Pesanan ditandai sudah diterima customer." : "Pesanan belum ditandai sampai ke customer."}</div></div></div><div className="grid grid-cols-2 gap-3 p-5"><AnimatedButton variant={received ? "ghost" : "primary"} onClick={() => saveDelivery(false)} disabled={saving}><X size={16} /> Belum sampai</AnimatedButton><AnimatedButton variant={received ? "primary" : "ghost"} onClick={() => saveDelivery(true)} disabled={saving}><CheckCircle2 size={16} /> Sudah sampai</AnimatedButton></div></section>
      <section className={`${card} p-5`}><h3 className="font-semibold">Customer</h3><div className="mt-4 text-sm"><b>{order.customer_name}</b><div className="mt-1 text-black/55">{order.customer_email}</div>{order.phone && <div className="mt-1 text-black/55">{order.phone}</div>}<div className="mt-3 rounded-xl bg-[#f6f3ed] p-4 leading-6">{order.address || "Alamat belum tersedia."}</div></div></section>
      <section className={`${card} p-5`}><div className="flex items-center justify-between"><h3 className="font-semibold">Ringkasan pembayaran</h3><span className="text-xs text-black/45">{statusLabel(order.status)}</span></div><div className="mt-4 space-y-3 text-sm"><Row label="Nilai produk setelah diskon" value={formatIDR(productSubtotal)} /><Row label="Pajak" value={formatIDR(taxTotal)} /><Row label="Ongkir dari checkout" value={shippingFee ? formatIDR(shippingFee) : "Gratis"} /><Row label="Total dibayar" value={formatIDR(order.total)} strong /><Row label="Modal barang" value={formatIDR(order.cost_total)} /><Row label="Laba setelah pajak" value={formatIDR(estimatedProfit)} strong /></div><div className="mt-4 rounded-xl bg-[#faf8f4] p-4 text-xs leading-5 text-black/45">Ongkir di sini hanya ditampilkan sebagai angka yang sudah tersimpan dari checkout. Tidak ada lagi input kurir, resi, atau nominal ongkir di tahap pengiriman.</div></section>
      {!!order.items?.length && <section className={`${card} p-5`}><h3 className="font-semibold">Produk dalam order</h3><div className="mt-4 space-y-3">{order.items.map((item:any) => <div key={item.id} className="flex items-center justify-between gap-4 rounded-xl border border-black/5 px-4 py-3 text-sm"><div><div className="font-medium">{item.title}</div><div className="mt-1 text-xs text-black/45">{item.quantity} × {formatIDR(item.unit_price)}</div></div><b>{formatIDR(Number(item.unit_price || 0) * Number(item.quantity || 1))}</b></div>)}</div></section>}
    </div>
  </motion.div></motion.div>;
}

function Discounts({ value, setValue, onSave, saving }: { value: any; setValue: (v: any) => void; onSave: () => void; saving: boolean }) { return <div><PageHeader eyebrow="PROMOSI" title="Diskon & harga promo" text="Atur diskon manual per produk atau otomatis berdasarkan stok menipis." /><div className="grid gap-6 lg:grid-cols-2"><section className={`${card} p-6`}><div className="flex items-start justify-between"><div><h2 className="text-lg font-semibold">Diskon otomatis stok menipis</h2><p className="mt-1 text-sm text-black/50">Produk dengan stok di bawah ambang akan mendapat diskon otomatis. Diskon manual tidak ditimpa.</p></div><Percent size={20} className="text-black/30" /></div><label className="mt-6 flex items-center gap-3 text-sm"><input type="checkbox" checked={!!value.enabled} onChange={e => setValue({ ...value, enabled: e.target.checked })} /> Aktifkan aturan otomatis</label><div className="mt-5 grid grid-cols-2 gap-4"><label className="text-sm">Stok ≤<input className={`${input} mt-2`} type="number" min="0" value={value.stockThreshold ?? 5} onChange={e => setValue({ ...value, stockThreshold: Number(e.target.value) })} /></label><label className="text-sm">Diskon %<input className={`${input} mt-2`} type="number" min="0" max="90" value={value.percentage ?? 10} onChange={e => setValue({ ...value, percentage: Number(e.target.value) })} /></label></div><AnimatedButton className="mt-6" onClick={onSave} disabled={saving}>{saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Simpan aturan</AnimatedButton></section><section className={`${card} p-6`}><h2 className="text-lg font-semibold">Diskon per produk</h2><p className="mt-2 text-sm text-black/50">Buka Produk & Stok → Edit. Di sana kamu bisa memilih diskon persen atau nominal, dan langsung melihat harga promo serta laba setelah diskon.</p><div className="mt-6 rounded-2xl bg-[#f6f3ed] p-5"><div className="text-xs uppercase tracking-[.18em] text-black/40">Contoh</div><div className="mt-3 text-sm">Harga Rp 200.000 · Modal Rp 110.000 · Diskon 10%</div><div className="mt-2 font-semibold">Harga promo Rp 180.000 · Laba Rp 70.000</div></div></section></div></div>; }

function StoreSettings({ value, setValue, onSave, saving }: { value: Settings; setValue: (v: Settings) => void; onSave: () => void; saving: boolean }) {
  const get = (k: Exclude<keyof Settings, "business">, fallback = "") => value[k] ?? fallback;
  const b = value.business || {};
  const commerce = value.commerceSettings || value.commerce_settings || {};
  return <div><PageHeader eyebrow="STORE" title="Toko & tampilan" text="Atur identitas toko, tarif ongkir yang dipakai saat checkout, dan pajak default. Ongkir ditetapkan saat checkout lalu disimpan sebagai snapshot order." /><div className="grid gap-6 lg:grid-cols-[1fr_340px]"><section className={`${card} p-6 space-y-5`}>
    <label className="block text-sm">Nama toko<input className={`${input} mt-2`} value={get("storeName", get("store_name", "MERX")) as string} onChange={e => setValue({ ...value, storeName: e.target.value })} /></label>
    <div className="grid grid-cols-2 gap-4"><label className="text-sm">Warna utama<input className="mt-2 h-12 w-full rounded-xl border border-black/10 bg-white p-1" type="color" value={get("primaryColor", get("primary_color", "#1B2A4A")) as string} onChange={e => setValue({ ...value, primaryColor: e.target.value })} /></label><label className="text-sm">Warna latar<input className="mt-2 h-12 w-full rounded-xl border border-black/10 bg-white p-1" type="color" value={get("accentColor", get("accent_color", "#F3EFE7")) as string} onChange={e => setValue({ ...value, accentColor: e.target.value })} /></label></div>
    <label className="block text-sm">Judul hero<textarea className={`${input} mt-2 min-h-24`} value={get("heroTitle", get("hero_title", "")) as string} onChange={e => setValue({ ...value, heroTitle: e.target.value })} /></label><label className="block text-sm">Deskripsi hero<textarea className={`${input} mt-2 min-h-24`} value={get("heroDescription", get("hero_description", "")) as string} onChange={e => setValue({ ...value, heroDescription: e.target.value })} /></label><label className="block text-sm">URL gambar hero<input className={`${input} mt-2`} value={get("heroImageUrl", get("hero_image_url", "")) as string} onChange={e => setValue({ ...value, heroImageUrl: e.target.value })} /></label>
    <section className="rounded-2xl border border-black/10 bg-[#faf8f4] p-5"><div className="flex items-start justify-between gap-4"><div><h3 className="font-semibold">Checkout otomatis</h3><p className="mt-1 text-sm text-black/50">Angka ini dipakai customer saat checkout. Admin tidak perlu memasukkan ulang ongkir.</p></div><ShoppingBag size={19} className="text-black/30" /></div><div className="mt-5 grid gap-4 sm:grid-cols-2"><Field label="Ongkir checkout (Rp)" value={String(commerce.shippingFee ?? 0)} type="number" onChange={v => setValue({ ...value, commerceSettings: { ...commerce, shippingFee: Math.max(0, Number(v)) } })} /><Field label="Pajak default (%)" value={String(commerce.taxRate ?? 11)} type="number" onChange={v => setValue({ ...value, commerceSettings: { ...commerce, taxRate: Math.max(0, Math.min(100, Number(v))) } })} /></div><div className="mt-4 grid gap-3 sm:grid-cols-2"><div className="rounded-xl border border-black/10 bg-white p-4"><div className="text-xs text-black/40">Mode pajak produk baru</div><div className="mt-1 font-semibold">Otomatis</div><div className="mt-1 text-xs text-black/45">Produk memakai tarif default ini kecuali dipilih Manual di editor.</div></div><div className="rounded-xl border border-black/10 bg-white p-4"><div className="text-xs text-black/40">Cara kerja ongkir</div><div className="mt-1 font-semibold">Ditetapkan saat checkout</div><div className="mt-1 text-xs text-black/45">Nominal diambil saat order dibuat dan tersimpan sebagai snapshot. Fulfillment tidak menghitung ulang.</div></div></div><p className="mt-4 text-xs leading-5 text-black/45">Catatan: kalkulasi pajak di MERX adalah kalkulasi internal harga/order. Tarif dan perlakuan pajak harus disesuaikan dengan status pajak usaha kamu.</p></section>
    <div className="border-t border-black/10 pt-5"><div className="font-semibold">Kontak toko</div><div className="mt-4 grid gap-4 sm:grid-cols-2"><Field label="Telepon" value={b.phone || ""} onChange={v => setValue({ ...value, business: { ...b, phone: v } })} /><Field label="Email toko" value={b.email || ""} onChange={v => setValue({ ...value, business: { ...b, email: v } })} /><Field label="WhatsApp" value={b.whatsapp || ""} onChange={v => setValue({ ...value, business: { ...b, whatsapp: v } })} /><Field label="Instagram" value={b.instagram || ""} onChange={v => setValue({ ...value, business: { ...b, instagram: v } })} /></div><label className="mt-4 block text-sm">Alamat toko<textarea className={`${input} mt-2 min-h-24`} value={b.address || ""} onChange={e => setValue({ ...value, business: { ...b, address: e.target.value } })} /></label><label className="mt-4 block text-sm">Catatan pengiriman<textarea className={`${input} mt-2 min-h-24`} value={b.shippingNote || ""} onChange={e => setValue({ ...value, business: { ...b, shippingNote: e.target.value } })} /></label></div><AnimatedButton onClick={onSave} disabled={saving}>{saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Simpan perubahan</AnimatedButton></section><section className={`${card} p-6`}><div className="flex items-center gap-2 text-xs uppercase tracking-[.2em] text-black/40"><Store size={15} /> Pratinjau</div><div className="mt-5 rounded-2xl p-6" style={{ background: (get("accentColor", get("accent_color", "#F3EFE7")) as string) }}><div className="text-xl font-black" style={{ color: (get("primaryColor", get("primary_color", "#1B2A4A")) as string) }}>{get("storeName", get("store_name", "MERX")) as string}</div><div className="mt-8 text-3xl font-semibold" style={{ color: (get("primaryColor", get("primary_color", "#1B2A4A")) as string) }}>{get("heroTitle") as string}</div><p className="mt-3 text-sm text-black/55">{get("heroDescription") as string}</p></div></section></div></div>;
}

function ProductEditor({ product, defaultTaxRate, saving, onClose, onSave }: { product: Product; defaultTaxRate: number; saving: boolean; onClose: () => void; onSave: (p: Product) => void }) {
  const originalMain = product.src_url || product.srcUrl || product.gallery?.[0] || "";
  const originalGallery = (product.gallery || []).filter(Boolean).filter((url) => url !== originalMain);
  const initialPricing = product.pricing || { mode: "manual" as PricingMode, target: 0 };
  const initialTax: Tax = product.tax?.mode === "manual" ? { mode: "manual", rate: Number(product.tax.rate || 0) } : { mode: "auto", rate: null };
  const [p, setP] = useState<Product>({ ...product, srcUrl: originalMain, src_url: originalMain, gallery: originalGallery, pricing: initialPricing, tax: initialTax });
  const cost = Number(p.cost_price ?? p.costPrice ?? 0);
  const rule = p.pricing || { mode: "manual" as PricingMode, target: 0 };
  const taxRule = p.tax || { mode: "auto" as const, rate: null };
  const calculatedPrice = calculateBasePrice(cost, rule, Number(p.price || 0));
  const summary = pricingSummary(cost, calculatedPrice, p.discount);
  const taxRate = resolveTaxRate(taxRule, defaultTaxRate);
  const taxAmount = calculateTax(summary.finalPrice, taxRate);
  const profitAfterTax = summary.finalPrice - taxAmount - cost;
  const set = (patch: Partial<Product>) => setP({ ...p, ...patch });
  const setPricing = (patch: Partial<Pricing>) => setP({ ...p, pricing: { ...rule, ...patch } });
  const setTax = (patch: Partial<Tax>) => setP({ ...p, tax: { ...taxRule, ...patch } });
  const mainImage = p.srcUrl || p.src_url || "/images/header-homepage.png";
  const additionalImages = (p.gallery || []).filter(Boolean).filter((url) => url !== mainImage);
  const parseDetails = () => Object.fromEntries((detailsText || "").split("\n").map((line: string) => line.split(":" )).filter((parts: string[]) => parts.length >= 2).map(([k, ...rest]: string[]) => [k.trim(), rest.join(":").trim()]).filter(([k]: string[]) => Boolean(k)));
  const detailsText: string = typeof (p as any).detailsText === "string" ? (p as any).detailsText : Object.entries(p.details || {}).map(([k, v]) => `${k}: ${v}`).join("\n");
  const setDetailsText = (value: string) => setP({ ...p, ...({ detailsText: value } as any) });

  const uploadImage = async (file: File, target: "main" | "gallery") => {
    const form = new FormData(); form.append("file", file);
    const res = await fetch("/api/admin/upload-image", { method: "POST", body: form }); const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Gagal upload gambar.");
    if (target === "main") setP(current => ({ ...current, srcUrl: data.url, src_url: data.url }));
    else setP(current => ({ ...current, gallery: Array.from(new Set([...(current.gallery || []), data.url])).filter((url) => url !== (current.srcUrl || current.src_url)).slice(0, 12) }));
  };

  const save = () => onSave({ ...p, price: calculatedPrice, cost_price: cost, srcUrl: mainImage === "/images/header-homepage.png" ? "" : mainImage, src_url: mainImage === "/images/header-homepage.png" ? "" : mainImage, gallery: additionalImages, details: parseDetails(), tax: taxRule.mode === "manual" ? { mode: "manual", rate: taxRate } : { mode: "auto", rate: null } });

  return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[55] bg-black/45 p-3 sm:p-6"><motion.div initial={{ y: 30, opacity: 0, scale: .98 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 20, opacity: 0 }} transition={{ duration: .22 }} className="mx-auto flex h-full max-w-6xl flex-col overflow-hidden rounded-3xl bg-white">
    <div className="flex items-center justify-between border-b border-black/10 px-5 py-4"><div><div className="font-semibold">{product.title ? "Edit produk" : "Tambah produk"}</div><div className="text-xs text-black/45">Harga, modal, diskon, pajak, stok, dan gambar tersimpan ke database.</div></div><button onClick={onClose} className="rounded-lg p-2 transition hover:bg-black/5"><X size={18} /></button></div>
    <div className="flex-1 overflow-y-auto p-5"><div className="grid gap-6 xl:grid-cols-[1fr_360px]"><div className="space-y-5">
      <section className={`${card} p-5`}><div className="flex items-center justify-between"><div><h3 className="font-semibold">Informasi produk</h3><p className="mt-1 text-sm text-black/45">Semua field inti katalog bisa diubah dari sini.</p></div><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={p.is_active !== false && p.isActive !== false} onChange={e => set({ isActive: e.target.checked, is_active: e.target.checked })} /> Aktif</label></div><div className="mt-5 grid gap-4 md:grid-cols-2"><Field label="Nama produk" value={p.title} onChange={v => set({ title: v })} /><Field label="Slug" value={p.slug} onChange={v => set({ slug: v })} /><Field label="Kategori" value={p.category} onChange={v => set({ category: v })} /><Field label="Gender" value={p.gender} onChange={v => set({ gender: v })} /><Field label="Warna" value={p.color} onChange={v => set({ color: v })} /><Field label="Ukuran (pisahkan koma)" value={(p.sizes || []).join(", ")} onChange={v => set({ sizes: v.split(",").map(x => x.trim()).filter(Boolean) })} /></div><label className="mt-4 block text-sm">Deskripsi<textarea className={`${input} mt-2 min-h-36`} value={p.description || ""} onChange={e => set({ description: e.target.value })} /></label><label className="mt-4 block text-sm">Detail / spesifikasi<textarea className={`${input} mt-2 min-h-32`} value={detailsText} onChange={e => setDetailsText(e.target.value)} placeholder="Bahan: Cotton\nFit: Regular\nPerawatan: Machine wash" /></label></section>
      <section className={`${card} p-5`}><div className="flex items-start justify-between gap-4"><div><h3 className="font-semibold">Harga, modal, dan laba</h3><p className="mt-1 text-sm text-black/45">Harga tetap bisa manual atau dihitung dari target keuntungan.</p></div><CircleDollarSign size={20} className="text-black/30" /></div><div className="mt-5 grid gap-4 md:grid-cols-2"><Field label="Modal / cost" value={String(cost)} type="number" onChange={v => set({ cost_price: Number(v), costPrice: Number(v) })} /><label className="text-sm">Mode harga<select className={`${input} mt-2`} value={rule.mode} onChange={e => setPricing({ mode: e.target.value as PricingMode })}><option value="manual">Harga manual</option><option value="profit">Target laba nominal</option><option value="markup">Markup dari modal (%)</option><option value="margin">Target margin dari harga (%)</option></select></label>{rule.mode === "manual" ? <Field label="Harga jual" value={String(p.price || 0)} type="number" onChange={v => set({ price: Number(v) })} /> : <Field label={rule.mode === "profit" ? "Target laba (Rp)" : "Target (%)"} value={String(rule.target)} type="number" onChange={v => setPricing({ target: Number(v) })} />}</div><div className="mt-5 grid gap-3 sm:grid-cols-3"><SummaryTile label="Harga dasar" value={formatIDR(calculatedPrice)} /><SummaryTile label="Harga promo" value={formatIDR(summary.finalPrice)} /><SummaryTile label="Laba setelah diskon" value={formatIDR(summary.profit)} positive={summary.profit >= 0} /></div><div className="mt-4 rounded-xl bg-[#f6f3ed] p-4 text-sm">Margin sebelum pajak: <b>{summary.margin.toFixed(1)}%</b>.</div></section>
      <section className={`${card} p-5`}><div className="flex items-start justify-between gap-4"><div><h3 className="font-semibold">Pajak produk</h3><p className="mt-1 text-sm text-black/45">Defaultnya otomatis mengikuti tarif pajak toko. Ubah ke Manual hanya untuk produk yang memang perlu tarif berbeda.</p></div><Percent size={20} className="text-black/30" /></div><div className="mt-5 grid gap-4 md:grid-cols-3"><label className="text-sm">Mode pajak<select className={`${input} mt-2`} value={taxRule.mode} onChange={e => setTax({ mode: e.target.value === "manual" ? "manual" : "auto" })}><option value="auto">Otomatis</option><option value="manual">Manual</option></select></label>{taxRule.mode === "manual" && <Field label="Tarif manual (%)" value={String(taxRate)} type="number" onChange={v => setTax({ rate: Number(v) })} />}<SummaryTile label={`Pajak (${taxRate.toFixed(2)}%)`} value={formatIDR(taxAmount)} /></div><div className="mt-4 grid gap-3 sm:grid-cols-2"><div className="rounded-xl border border-black/10 p-4"><div className="text-xs text-black/45">Pajak estimasi</div><div className="mt-1 font-semibold">{formatIDR(taxAmount)}</div><div className="mt-1 text-xs text-black/45">Dihitung dari harga promo.</div></div><div className="rounded-xl border border-black/10 p-4"><div className="text-xs text-black/45">Laba setelah pajak</div><div className={`mt-1 font-semibold ${profitAfterTax >= 0 ? "text-emerald-700" : "text-red-700"}`}>{formatIDR(profitAfterTax)}</div></div></div><p className="mt-4 text-xs leading-5 text-black/45">Kalkulasi ini untuk membantu pricing internal dan tidak menetapkan kewajiban pajak secara hukum.</p></section>
      <section className={`${card} p-5`}><div className="flex items-center justify-between"><div><h3 className="font-semibold">Diskon produk</h3><p className="mt-1 text-sm text-black/45">Diskon manual tetap lebih prioritas daripada diskon otomatis stok.</p></div><Percent size={20} className="text-black/30" /></div><div className="mt-5 grid gap-4 md:grid-cols-3"><label className="text-sm">Jenis<select className={`${input} mt-2`} value={Number(p.discount?.percentage || 0) > 0 ? "percentage" : Number(p.discount?.amount || 0) > 0 ? "amount" : "none"} onChange={e => { const type = e.target.value; set({ discount: type === "percentage" ? { amount: 0, percentage: p.discount?.percentage || 10, source: "manual" } : type === "amount" ? { amount: p.discount?.amount || 10000, percentage: 0, source: "manual" } : { amount: 0, percentage: 0, source: "manual" } }); }}><option value="none">Tanpa diskon</option><option value="percentage">Persentase</option><option value="amount">Nominal</option></select></label><Field label="Nilai %" value={String(p.discount?.percentage || 0)} type="number" onChange={v => set({ discount: { amount: 0, percentage: Math.max(0, Math.min(90, Number(v))), source: "manual" } })} /><Field label="Nominal Rp" value={String(p.discount?.amount || 0)} type="number" onChange={v => set({ discount: { amount: Math.max(0, Number(v)), percentage: 0, source: "manual" } })} /></div></section>
      <section className={`${card} p-5`}><h3 className="font-semibold">Stok</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><Field label="Jumlah stok" value={String(p.stock || 0)} type="number" onChange={v => set({ stock: Math.max(0, Number(v)) })} /><Field label="ID produk" value={String(p.id)} onChange={() => {}} /></div></section>
    </div><div className="space-y-5">
      <section className={`${card} p-5`}><div className="flex items-center justify-between"><div><h3 className="font-semibold">Gambar utama</h3><p className="mt-1 text-xs text-black/45">Gambar ini berdiri sendiri. Upload/ubah di sini tidak lagi masuk ke gallery.</p></div><ImageIcon size={19} className="text-black/30" /></div><div className="mt-4 overflow-hidden rounded-2xl bg-[#f3efe7]"><img src={mainImage || "/images/header-homepage.png"} onError={e => { e.currentTarget.src = "/images/header-homepage.png"; }} className="aspect-square w-full object-cover" alt={p.title} /></div><label className="mt-4 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-black/15 bg-[#faf8f4] px-4 py-3 text-sm transition hover:border-black/25 hover:bg-[#f5f1e9]"><Upload size={16} /> Ganti gambar utama<input className="hidden" type="file" accept="image/*" onChange={async e => { const file = e.target.files?.[0]; if (!file) return; try { await uploadImage(file, "main"); } catch (err) { alert(err instanceof Error ? err.message : "Upload gagal"); } e.currentTarget.value=""; }} /></label><label className="mt-4 block text-sm">URL gambar utama<input className={`${input} mt-2`} value={p.srcUrl || p.src_url || ""} onChange={e => setP({ ...p, srcUrl: e.target.value, src_url: e.target.value })} placeholder="https://..." /></label></section>
      <section className={`${card} p-5`}><div><h3 className="font-semibold">Gallery tambahan</h3><p className="mt-1 text-xs text-black/45">Gunakan untuk foto kedua, detail bahan, belakang, atau angle lain.</p></div><label className="mt-4 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-black/15 bg-[#faf8f4] px-4 py-3 text-sm transition hover:border-black/25 hover:bg-[#f5f1e9]"><Upload size={16} /> Tambah gambar gallery<input className="hidden" type="file" accept="image/*" onChange={async e => { const file = e.target.files?.[0]; if (!file) return; try { await uploadImage(file, "gallery"); } catch (err) { alert(err instanceof Error ? err.message : "Upload gagal"); } e.currentTarget.value=""; }} /></label><textarea className={`${input} mt-4 min-h-32`} value={additionalImages.join("\n")} onChange={e => setP({ ...p, gallery: Array.from(new Set(e.target.value.split("\n").map(x => x.trim()).filter(Boolean))).filter((url) => url !== (p.srcUrl || p.src_url)).slice(0, 12) })} placeholder="Satu URL per baris" /><div className="mt-3 space-y-2">{additionalImages.slice(0,6).map((url,index)=><div key={`${url}-${index}`} className="flex items-center gap-3 rounded-xl border border-black/5 px-3 py-2"><img src={url} className="h-10 w-10 rounded-lg object-cover bg-[#f3efe7]" alt="" onError={e => { e.currentTarget.src = "/images/header-homepage.png"; }} /><span className="min-w-0 flex-1 truncate text-xs text-black/50">Foto {index+1}</span></div>)}</div></section>
      <section className={`${card} p-5`}><h3 className="font-semibold">Ringkasan produk</h3><div className="mt-4 space-y-3 text-sm"><Row label="Harga dasar" value={formatIDR(calculatedPrice)} /><Row label="Harga promo" value={formatIDR(summary.finalPrice)} /><Row label="Pajak" value={formatIDR(taxAmount)} /><Row label="Modal" value={formatIDR(cost)} /><Row label="Laba setelah pajak" value={formatIDR(profitAfterTax)} strong /><Row label="Margin setelah pajak" value={`${summary.finalPrice > 0 ? ((profitAfterTax / summary.finalPrice) * 100).toFixed(1) : "0.0"}%`} strong /></div></section>
    </div></div></div>
    <div className="flex justify-end gap-2 border-t border-black/10 p-5"><AnimatedButton variant="ghost" onClick={onClose}>Batal</AnimatedButton><AnimatedButton onClick={save} disabled={saving}>{saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} {saving ? "Menyimpan…" : "Simpan produk"}</AnimatedButton></div>
  </motion.div></motion.div>;
}

function PageHeader({ eyebrow, title, text, action }: { eyebrow: string; title: string; text: string; action?: React.ReactNode }) { return <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs uppercase tracking-[.24em] text-black/35">{eyebrow}</p><h1 className="mt-2 text-3xl font-semibold tracking-tight lg:text-4xl">{title}</h1><p className="mt-2 max-w-3xl text-sm text-black/55">{text}</p></div>{action}</div>; }
function Metric({ title, value, icon, positive }: { title: string; value: string; icon: React.ReactNode; positive?: boolean }) { return <motion.div whileHover={{ y: -2 }} transition={{ type: "spring", stiffness: 320, damping: 24 }} className={`${card} p-5`}><div className="flex items-start justify-between gap-3"><div className="text-xs uppercase tracking-[.14em] text-black/40">{title}</div><span className="text-black/30">{icon}</span></div><div className={`mt-3 text-2xl font-semibold tracking-tight ${positive === false ? "text-red-700" : "text-[#1B2A4A]"}`}>{value}</div></motion.div>; }
function Panel({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) { return <section className={`${card} p-6 ${className}`}><div className="mb-5 flex items-center justify-between gap-4"><h2 className="text-lg font-semibold tracking-tight">{title}</h2></div>{children}</section>; }
function Empty({ text }: { text: string }) { return <div className="rounded-xl bg-[#f6f3ed] p-5 text-sm text-black/50">{text}</div>; }
function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) { return <label className="text-sm">{label}<input className={`${input} mt-2`} type={type} value={value} onChange={e => onChange(e.target.value)} /></label>; }
function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) { return <div className="flex items-center justify-between border-b border-black/5 pb-3 last:border-0"><span className="text-black/50">{label}</span><b className={strong ? "text-[#1B2A4A]" : ""}>{value}</b></div>; }
function SummaryTile({ label, value, positive = true }: { label: string; value: string; positive?: boolean }) { return <div className="rounded-xl border border-black/10 p-4"><div className="text-xs text-black/45">{label}</div><div className={`mt-1 font-semibold ${positive ? "text-[#1B2A4A]" : "text-red-700"}`}>{value}</div></div>; }
function DeliveryBadge({ received }: { received: boolean }) { return <span className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium ${received ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-amber-200 bg-amber-50 text-amber-800"}`}>{received ? <CheckCircle2 size={14} /> : <Package size={14} />}{received ? "Sudah sampai" : "Belum sampai"}</span>; }
function StatusBadge({ status }: { status: string }) { const classes: Record<string, string> = { ready_to_ship: "bg-amber-50 text-amber-700", shipped: "bg-blue-50 text-blue-700", delivered: "bg-emerald-50 text-emerald-700", cancelled: "bg-red-50 text-red-700" }; return <span className={`rounded-full px-2.5 py-1 text-xs ${classes[status] || "bg-black/5 text-black/55"}`}>{statusLabel(status)}</span>; }
function statusLabel(status: string) { return ({ paid: "Dibayar", processing: "Diproses", packed: "Dikemas", ready_to_ship: "Siap kirim", shipped: "Dikirim", delivered: "Selesai", cancelled: "Dibatalkan" } as Record<string, string>)[status] || status; }
function blankProduct(products: Product[]): Product { return { id: Math.max(0, ...products.map(p => p.id)) + 1, title: "", slug: "", srcUrl: "/images/header-homepage.png", src_url: "/images/header-homepage.png", gallery: ["/images/header-homepage.png"], price: 0, discount: { amount: 0, percentage: 0, source: "manual" }, tax: { mode: "auto", rate: null }, pricing: { mode: "manual", target: 0 }, rating: 0, category: "T-Shirts", gender: "Unisex", color: "White", sizes: ["S", "M", "L"], description: "", details: {}, faqs: [], reviews: [], stock: 0, cost_price: 0, is_active: true, isActive: true };
}
