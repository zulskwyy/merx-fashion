import { Product } from "@/types/product.types";

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
    const data = text ? JSON.parse(text) : null;
    if (!r.ok) throw new Error(data?.message || data?.error || `Database error ${r.status}`);
    return data as T;
  });
}

export type AdminProduct = Product & { stock: number; costPrice: number; isActive: boolean };
export type StoreSettings = {
  id: number;
  storeName: string;
  primaryColor: string;
  accentColor: string;
  heroTitle: string;
  heroDescription: string;
  heroImageUrl: string;
  updatedAt?: string;
};
