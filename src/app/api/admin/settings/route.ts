import { NextResponse } from "next/server";
import { getAdminEmail } from "@/lib/server/admin-auth";
import { dbConfigured, supabaseRequest } from "@/lib/server/supabase";

export async function GET() {
  if (!getAdminEmail()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!dbConfigured) return NextResponse.json({ error: "Database belum dikonfigurasi." }, { status: 503 });
  try {
    const rows = await supabaseRequest<any[]>("store_settings?select=*&id=eq.1&limit=1");
    return NextResponse.json(rows?.[0] || null);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Gagal memuat pengaturan toko." }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  if (!getAdminEmail()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!dbConfigured) return NextResponse.json({ error: "Database belum dikonfigurasi." }, { status: 503 });
  try {
    const b = await req.json();
    const row = {
      store_name: b.storeName || "MERX",
      primary_color: b.primaryColor || "#1B2A4A",
      accent_color: b.accentColor || "#F3EFE7",
      hero_title: b.heroTitle || "",
      hero_description: b.heroDescription || "",
      hero_image_url: b.heroImageUrl || "",
      business: {
        phone: b.business?.phone || "",
        email: b.business?.email || "",
        whatsapp: b.business?.whatsapp || "",
        address: b.business?.address || "",
        instagram: b.business?.instagram || "",
        shippingNote: b.business?.shippingNote || "",
      },
      updated_at: new Date().toISOString(),
    };
    const data = await supabaseRequest("store_settings?id=eq.1", { method: "PATCH", headers: { Prefer: "return=representation" }, body: JSON.stringify(row) });
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Gagal menyimpan pengaturan toko." }, { status: 500 });
  }
}
