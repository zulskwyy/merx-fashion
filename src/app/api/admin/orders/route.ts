import { NextResponse } from "next/server";
import { getAdminEmail } from "@/lib/server/admin-auth";
import { dbConfigured, supabaseRequest } from "@/lib/server/supabase";

const STATUS = ["paid", "processing", "packed", "ready_to_ship", "shipped", "delivered", "cancelled"];

export async function GET() {
  if (!getAdminEmail()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!dbConfigured) return NextResponse.json([]);
  try {
    const [orders, items] = await Promise.all([
      supabaseRequest<any[]>("orders?select=*&order=created_at.desc&limit=100"),
      supabaseRequest<any[]>("order_items?select=*&limit=1000"),
    ]);
    const byOrder = (items || []).reduce((acc: Record<string, any[]>, item: any) => {
      const key = String(item.order_id);
      (acc[key] ||= []).push(item);
      return acc;
    }, {});
    return NextResponse.json((orders || []).map((order: any) => ({ ...order, items: byOrder[String(order.id)] || [] })));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Gagal memuat pesanan." }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  if (!getAdminEmail()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!dbConfigured) return NextResponse.json({ error: "Database belum dikonfigurasi." }, { status: 503 });
  try {
    const body = await req.json();
    const id = Number(body.id);
    if (!id) return NextResponse.json({ error: "ID order tidak valid." }, { status: 400 });
    const status = String(body.status || "paid");
    if (!STATUS.includes(status)) return NextResponse.json({ error: "Status order tidak valid." }, { status: 400 });
    const shipping = {
      courier: String(body.shipping?.courier || ""),
      trackingNumber: String(body.shipping?.trackingNumber || ""),
      shippingFee: Math.max(0, Math.round(Number(body.shipping?.shippingFee || 0))),
      shippingCost: Math.max(0, Math.round(Number(body.shipping?.shippingCost || 0))),
      note: String(body.shipping?.note || ""),
      updatedAt: new Date().toISOString(),
    };
    const row = {
      status,
      shipping,
      other_cost: Math.max(0, Math.round(Number(body.other_cost ?? 0))),
      updated_at: new Date().toISOString(),
    };
    const data = await supabaseRequest(`orders?id=eq.${id}`, {
      method: "PATCH",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify(row),
    });
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Gagal memperbarui pesanan." }, { status: 500 });
  }
}
