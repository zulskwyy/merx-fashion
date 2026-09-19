import { NextResponse } from "next/server";
import { timingSafeEqual, scryptSync } from "crypto";
import { dbConfigured, supabaseRequest } from "@/lib/server/supabase";
import { setCustomerSessionCookie } from "@/lib/server/customer-auth";

function verifyPassword(password: string, stored: string) {
  const [saltB64, hashB64] = String(stored || "").split(".");
  if (!saltB64 || !hashB64) return false;
  try {
    const salt = Buffer.from(saltB64, "base64url");
    const expected = Buffer.from(hashB64, "base64url");
    const actual = scryptSync(password, salt, expected.length);
    return actual.length === expected.length && timingSafeEqual(actual, expected);
  } catch { return false; }
}

export async function POST(req: Request) {
  try {
    if (!dbConfigured) return NextResponse.json({ error: "Akun pelanggan belum terhubung ke database." }, { status: 503 });
    const body = await req.json().catch(() => ({}));
    const email = String(body?.email || "").trim().toLowerCase();
    const password = String(body?.password || "");
    const remember = Boolean(body?.remember);
    const rows = await supabaseRequest<Array<{ id: number; name: string; email: string; password_hash: string }>>(`customer_accounts?select=id,name,email,password_hash&email=eq.${encodeURIComponent(email)}&limit=1`);
    const user = rows?.[0];
    if (!user || !verifyPassword(password, user.password_hash)) return NextResponse.json({ error: "Email atau kata sandi tidak sesuai." }, { status: 401 });
    await setCustomerSessionCookie(Number(user.id), remember);
    return NextResponse.json({ user: { id: Number(user.id), name: user.name, email: user.email } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Gagal masuk." }, { status: 500 });
  }
}
