import { NextResponse } from "next/server";
import { getAdminEmail, isAdminConfigured, refreshAdminCookie } from "@/lib/server/admin-auth";

export async function GET() {
  const email = getAdminEmail();
  if (email) refreshAdminCookie(email);
  return NextResponse.json({
    authenticated: Boolean(email),
    configured: isAdminConfigured(),
    email,
    expiresInDays: 30,
  });
}
