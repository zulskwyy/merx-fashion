import { NextResponse } from "next/server";
import { getAdminEmail } from "@/lib/server/admin-auth";
import { dbConfigured, supabaseRequest } from "@/lib/server/supabase";

export async function GET() {
  if (!getAdminEmail()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!dbConfigured) return NextResponse.json({ balance: 0, transactions: [], configured: false });

  try {
    const [walletRows, transactions] = await Promise.all([
      supabaseRequest<any[]>("store_wallets?select=*&id=eq.1&limit=1"),
      supabaseRequest<any[]>("wallet_transactions?select=*&wallet_id=eq.1&order=created_at.desc&limit=100"),
    ]);
    return NextResponse.json({
      configured: true,
      balance: Number(walletRows?.[0]?.balance || 0),
      transactions: transactions || [],
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Gagal memuat saldo." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  if (!getAdminEmail()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!dbConfigured) return NextResponse.json({ error: "Database belum dikonfigurasi." }, { status: 503 });

  try {
    const body = await req.json().catch(() => ({}));
    const amount = Math.max(0, Math.round(Number(body.amount || 0)));
    const method = String(body.method || "bank").trim();
    const destination = String(body.destination || "").trim();
    const note = String(body.note || "").trim();

    if (!amount) return NextResponse.json({ error: "Jumlah penarikan harus lebih dari 0." }, { status: 400 });
    if (!destination) return NextResponse.json({ error: "Tujuan rekening / wallet harus diisi." }, { status: 400 });

    const result = await supabaseRequest<any>("rpc/merx_withdraw_wallet", {
      method: "POST",
      body: JSON.stringify({
        p_amount: amount,
        p_method: method,
        p_destination: destination,
        p_note: note,
      }),
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Gagal menarik saldo." }, { status: 500 });
  }
}
