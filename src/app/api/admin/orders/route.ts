import { NextResponse } from "next/server";
import { getAdminEmail } from "@/lib/server/admin-auth";
import { dbConfigured, supabaseRequest } from "@/lib/server/supabase";

const STATUS = ["paid", "processing", "packed", "ready_to_ship", "shipped", "delivered", "cancelled"];
const DELIVERY_STATUS = ["pending", "delivered"];

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
    const row: Record<string, any> = { updated_at: new Date().toISOString() };

    if (body.status !== undefined) {
      const status = String(body.status || "paid");
      if (!STATUS.includes(status)) return NextResponse.json({ error: "Status order tidak valid." }, { status: 400 });
      row.status = status;
    }

    if (body.delivery_status !== undefined) {
      const deliveryStatus = String(body.delivery_status || "pending");
      if (!DELIVERY_STATUS.includes(deliveryStatus)) return NextResponse.json({ error: "Status penerimaan tidak valid." }, { status: 400 });
      row.delivery_status = deliveryStatus;
      row.delivered_at = deliveryStatus === "delivered" ? (body.delivered_at || new Date().toISOString()) : null;
    }

    if (body.other_cost !== undefined) row.other_cost = Math.max(0, Math.round(Number(body.other_cost || 0)));

    // Ongkir adalah snapshot saat checkout. Fulfillment admin hanya mengubah status penerimaan.

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
