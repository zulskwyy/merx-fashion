import { NextResponse } from "next/server";
import { getAdminEmail } from "@/lib/server/admin-auth";
import { dbConfigured, ensureProductsSeeded, supabaseRequest } from "@/lib/server/supabase";
import { calculateBasePrice, normalizePricingRule } from "@/lib/admin-pricing";
import { adminBody, adminPath, adminTable, isDemoAdmin } from "@/lib/server/admin-scope";

function guard() {
  if (!getAdminEmail()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!dbConfigured) return NextResponse.json({ error: "Database belum dikonfigurasi." }, { status: 503 });
  return null;
}

function cleanSlug(value: string, fallback: string) {
  const slug = String(value || fallback)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || `produk-${Date.now()}`;
}

function normalizeImages(body: any, current?: any) {
  const main = String(body.srcUrl || body.src_url || current?.src_url || "").trim();
  const gallery = Array.isArray(body.gallery)
    ? body.gallery.map((v: any) => String(v || "").trim()).filter(Boolean).filter((v: string) => v !== main)
    : (Array.isArray(current?.gallery) ? current.gallery.map((v: any) => String(v || "").trim()).filter(Boolean).filter((v: string) => v !== main) : []);
  return { main, gallery: Array.from(new Set(gallery)).slice(0, 12) };
}

function buildRow(body: any, current?: any) {
  const costPrice = Number(body.costPrice ?? body.cost_price ?? current?.cost_price ?? Math.round(Number(body.price || 0) * 0.55));
  const pricing = normalizePricingRule(body.pricing ?? current?.pricing ?? { mode: "manual", target: 0 });
  const suppliedPrice = Number(body.price ?? current?.price ?? 0);
  const price = calculateBasePrice(costPrice, pricing, suppliedPrice);
  const images = normalizeImages(body, current);
  const srcUrl = images.main || "/images/header-homepage.png";
  const gallery = images.gallery;
  const discount = {
    amount: Math.max(0, Number(body.discount?.amount ?? current?.discount?.amount ?? 0)),
    percentage: Math.max(0, Math.min(90, Number(body.discount?.percentage ?? current?.discount?.percentage ?? 0))),
    source: body.discount?.source ?? current?.discount?.source ?? "manual",
  };

  return {
    id: Number(body.id ?? current?.id ?? Date.now()),
    title: String(body.title ?? current?.title ?? "Produk Baru").trim(),
    slug: cleanSlug(body.slug ?? current?.slug, body.title ?? current?.title ?? "produk"),
    src_url: srcUrl,
    gallery,
    price,
    discount,
    tax: {
      mode: body.tax?.mode === "manual" ? "manual" : "auto",
      rate: body.tax?.mode === "manual" ? Math.max(0, Math.min(100, Number(body.tax?.rate ?? 0))) : null,
    },
    pricing,
    rating: Number(body.rating ?? current?.rating ?? 0),
    review_count: Number(body.reviewCount ?? body.review_count ?? current?.review_count ?? 0),
    category: String(body.category ?? current?.category ?? "T-Shirts"),
    gender: String(body.gender ?? current?.gender ?? "Unisex"),
    color: String(body.color ?? current?.color ?? "White"),
    sizes: Array.isArray(body.sizes) ? body.sizes : (current?.sizes || ["S", "M", "L"]),
    description: String(body.description ?? current?.description ?? ""),
    details: body.details ?? current?.details ?? {},
    faqs: body.faqs ?? current?.faqs ?? [],
    reviews: body.reviews ?? current?.reviews ?? [],
    source_page: String(body.sourcePage ?? body.source_page ?? current?.source_page ?? ""),
    source_id: String(body.sourceId ?? body.source_id ?? current?.source_id ?? body.id ?? Date.now()),
    source_description: String(body.sourceDescription ?? body.source_description ?? current?.source_description ?? ""),
    stock: Math.max(0, Number(body.stock ?? current?.stock ?? 0)),
    cost_price: Math.max(0, Math.round(costPrice)),
    is_active: body.isActive !== false && body.is_active !== false,
    updated_at: new Date().toISOString(),
  };
}

export async function GET() {
  const denied = guard();
  if (denied) return denied;
  try {
    if (!isDemoAdmin()) await ensureProductsSeeded();
    const rows = await supabaseRequest<any[]>(adminPath("products", "select=*&order=id.asc&limit=500"));
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Gagal memuat produk." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const denied = guard();
  if (denied) return denied;
  try {
    const body = await req.json();
    const row = buildRow(body);
    if (isDemoAdmin()) delete (row as any).id;
    if (!row.title) return NextResponse.json({ error: "Nama produk wajib diisi." }, { status: 400 });
    const data = await supabaseRequest(adminTable("products"), {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify(adminBody(row)),
    });
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Gagal menambah produk." }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const denied = guard();
  if (denied) return denied;
  try {
    const body = await req.json();
    const id = Number(body.id);
    if (!id) return NextResponse.json({ error: "ID produk tidak valid." }, { status: 400 });
    const currentRows = await supabaseRequest<any[]>(adminPath("products", `select=*&id=eq.${id}&limit=1`));
    const current = currentRows?.[0];
    if (!current) return NextResponse.json({ error: "Produk tidak ditemukan." }, { status: 404 });
    const row = buildRow({ ...current, ...body }, current);
    const data = await supabaseRequest(adminPath("products", `id=eq.${id}`), {
      method: "PATCH",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify(adminBody(row)),
    });
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Gagal menyimpan produk." }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const denied = guard();
  if (denied) return denied;
  try {
    const { id } = await req.json();
    const productId = Number(id);
    if (!productId) return NextResponse.json({ error: "ID produk tidak valid." }, { status: 400 });
    await supabaseRequest(adminPath("products", `id=eq.${productId}`), { method: "DELETE" });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Gagal menghapus produk." }, { status: 500 });
  }
}
