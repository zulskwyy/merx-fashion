import { Product } from "@/types/product.types";
import { products } from "@/data/products";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
export const dbConfigured = Boolean(url && key);

export async function supabaseRequest<T = unknown>(path: string, init: RequestInit = {}) {
  if (!dbConfigured) throw new Error("Database belum dikonfigurasi. Isi SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY.");
  const headers = new Headers(init.headers);
  headers.set("apikey", key!);
  headers.set("Authorization", `Bearer ${key!}`);
  headers.set("Content-Type", "application/json");
  return fetch(`${url}/rest/v1/${path}`, { ...init, headers, cache: "no-store" }).then(async (r) => {
    const text = await r.text();
    let data: any = null;
    try { data = text ? JSON.parse(text) : null; } catch { data = text; }
    if (!r.ok) throw new Error(data?.message || data?.error || `Database error ${r.status}`);
    return data as T;
  });
}

export type AdminProduct = Product & { stock: number; costPrice: number; isActive: boolean; pricing?: { mode: string; target: number } };
export type StoreSettings = {
  id: number;
  storeName: string;
  primaryColor: string;
  accentColor: string;
  heroTitle: string;
  heroDescription: string;
  heroImageUrl: string;
  commerceSettings?: { shippingFee?: number; taxRate?: number };
  commerce_settings?: { shippingFee?: number; taxRate?: number };
  business?: { phone?: string; email?: string; whatsapp?: string; address?: string; instagram?: string; shippingNote?: string };
  updatedAt?: string;
};

export async function ensureProductsSeeded() {
  if (!dbConfigured) return false;
  const existing = await supabaseRequest<Array<{ id: number }>>("products?select=id&limit=500");
  const existingIds = new Set((existing || []).map((row) => Number(row.id)));
  const missing = products.filter((p) => !existingIds.has(p.id));
  if (!missing.length) return false;
  const rows = missing.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    src_url: p.srcUrl,
    gallery: p.gallery,
    price: p.price,
    discount: p.discount,
    tax: { mode: "auto", rate: null },
    pricing: { mode: "manual", target: 0 },
    rating: p.rating,
    review_count: p.reviewCount,
    category: p.category,
    gender: p.gender,
    color: p.color,
    sizes: p.sizes,
    description: p.description,
    details: p.details,
    faqs: p.faqs,
    reviews: p.reviews,
    source_page: p.sourcePage,
    source_id: p.sourceId,
    source_description: p.sourceDescription,
    stock: 20,
    cost_price: Math.round(p.price * 0.55),
    is_active: true,
    updated_at: new Date().toISOString(),
  }));
  await supabaseRequest("products", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify(rows),
  });
  return true;
}
