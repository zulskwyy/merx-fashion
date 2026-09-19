import { NextResponse } from "next/server";
import { randomBytes, scryptSync } from "crypto";
import { dbConfigured, supabaseRequest } from "@/lib/server/supabase";
import { setCustomerSessionCookie } from "@/lib/server/customer-auth";

function normalizeEmail(value: unknown) { return String(value || "").trim().toLowerCase(); }
function passwordHash(password: string) {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, 64);
  return `${salt.toString("base64url")}.${hash.toString("base64url")}`;
}

export async function POST(req: Request) {
  try {
    if (!dbConfigured) return NextResponse.json({ error: "Akun pelanggan belum terhubung ke database." }, { status: 503 });
    const body = await req.json().catch(() => ({}));
    const name = String(body?.name || "").trim();
    const email = normalizeEmail(body?.email);
    const password = String(body?.password || "");
    const remember = Boolean(body?.remember);
    if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 8) {
      return NextResponse.json({ error: "Gunakan nama, email valid, dan kata sandi minimal 8 karakter." }, { status: 400 });
    }
    const existing = await supabaseRequest<Array<{ id: number }>>(`customer_accounts?select=id&email=eq.${encodeURIComponent(email)}&limit=1`);
    if (existing?.length) return NextResponse.json({ error: "Email sudah terdaftar. Silakan masuk." }, { status: 409 });
    const rows = await supabaseRequest<Array<{ id: number; name: string; email: string }>>("customer_accounts", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({ name, email, password_hash: passwordHash(password) }),
    });
    const user = rows?.[0];
    if (!user?.id) return NextResponse.json({ error: "Akun gagal dibuat." }, { status: 500 });
    await setCustomerSessionCookie(Number(user.id), remember);
    return NextResponse.json({ user: { id: Number(user.id), name: user.name, email: user.email } }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Gagal membuat akun." }, { status: 500 });
  }
}

