import { NextResponse } from "next/server";
import { isAdminConfigured, setAdminCookie, validAdmin } from "@/lib/server/admin-auth";
export async function POST(req: Request) {
  const { email = "", password = "" } = await req.json().catch(() => ({}));
  if (!isAdminConfigured()) return NextResponse.json({ error: "Admin belum dikonfigurasi di Environment Variables Vercel." }, { status: 503 });
  if (!validAdmin(email, password)) return NextResponse.json({ error: "Email atau kata sandi admin salah." }, { status: 401 });
  setAdminCookie(email);
  return NextResponse.json({ ok: true });
}
