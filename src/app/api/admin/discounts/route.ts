import { NextResponse } from "next/server";
import { getAdminEmail } from "@/lib/server/admin-auth";
import { dbConfigured, supabaseRequest } from "@/lib/server/supabase";

const defaultRule = { id: 1, name: "Stok menipis", enabled: false, stockThreshold: 5, percentage: 10 };

export async function GET() {
  if (!getAdminEmail()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!dbConfigured) return NextResponse.json(defaultRule);
  try {
    const rows = await supabaseRequest<any[]>("discount_rules?select=*&id=eq.1&limit=1");
    const r = rows?.[0];
    return NextResponse.json(r ? { id: r.id, name: r.name, enabled: r.enabled, stockThreshold: r.stock_threshold, percentage: r.percentage } : defaultRule);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Gagal memuat aturan diskon." }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  if (!getAdminEmail()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!dbConfigured) return NextResponse.json({ error: "Database belum dikonfigurasi." }, { status: 503 });
  try {
    const b = await req.json();
    const row = {
      enabled: Boolean(b.enabled),
      stock_threshold: Math.max(0, Number(b.stockThreshold ?? 5)),
      percentage: Math.max(0, Math.min(90, Number(b.percentage ?? 10))),
      updated_at: new Date().toISOString(),
    };
    await supabaseRequest("discount_rules?id=eq.1", { method: "PATCH", headers: { Prefer: "return=minimal" }, body: JSON.stringify(row) });
    const ps = await supabaseRequest<any[]>("products?select=id,stock,discount&limit=500");
    for (const p of ps || []) {
      const current = p.discount || { amount: 0, percentage: 0 };
      const isAuto = current.source === "auto";
      const hasManualDiscount = !isAuto && (Number(current.amount || 0) > 0 || Number(current.percentage || 0) > 0);
      const shouldAuto = row.enabled && Number(p.stock) <= row.stock_threshold;
      if (shouldAuto && !hasManualDiscount) {
        await supabaseRequest(`products?id=eq.${p.id}`, {
          method: "PATCH",
          headers: { Prefer: "return=minimal" },
          body: JSON.stringify({ discount: { amount: 0, percentage: row.percentage, source: "auto" }, updated_at: new Date().toISOString() }),
        });
      } else if (isAuto) {
        await supabaseRequest(`products?id=eq.${p.id}`, {
          method: "PATCH",
          headers: { Prefer: "return=minimal" },
          body: JSON.stringify({ discount: { amount: 0, percentage: 0, source: "manual" }, updated_at: new Date().toISOString() }),
        });
      }
    }
    return NextResponse.json({ ...defaultRule, ...{ enabled: row.enabled, stockThreshold: row.stock_threshold, percentage: row.percentage } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Gagal menyimpan aturan diskon." }, { status: 500 });
  }
}
