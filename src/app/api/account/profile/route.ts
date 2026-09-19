import { NextResponse } from "next/server";
import { getCustomerSession } from "@/lib/server/customer-auth";
import { dbConfigured, supabaseRequest } from "@/lib/server/supabase";

export async function PATCH(req: Request) {
  try {
    if (!dbConfigured) return NextResponse.json({ error: "Akun pelanggan belum terhubung ke database." }, { status: 503 });
    const session = await getCustomerSession();
    if (!session) return NextResponse.json({ error: "Silakan masuk terlebih dahulu." }, { status: 401 });
    const body = await req.json().catch(() => ({}));
    const name = String(body?.name || "").trim();
    if (name.length < 2) return NextResponse.json({ error: "Nama minimal 2 karakter." }, { status: 400 });
    const rows = await supabaseRequest<Array<{ id: number; name: string; email: string }>>(`customer_accounts?id=eq.${session.id}`, {
      method: "PATCH",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({ name, updated_at: new Date().toISOString() }),
    });
    const user = rows?.[0];
    if (!user) return NextResponse.json({ error: "Akun tidak ditemukan." }, { status: 404 });
    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Gagal menyimpan akun." }, { status: 500 });
  }
}
