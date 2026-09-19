import { NextResponse } from "next/server";
import { getAdminContext, isAdminConfigured, refreshAdminCookie } from "@/lib/server/admin-auth";

export async function GET() {
  const context = getAdminContext();
  if (context?.mode === "live") refreshAdminCookie(context.email);
  return NextResponse.json({
    authenticated: Boolean(context),
    configured: isAdminConfigured(),
    email: context?.email || null,
    mode: context?.mode || null,
    demo: context?.mode === "demo",
    workspaceId: context?.workspaceId || null,
    expiresInDays: context?.mode === "demo" ? 1 : 30,
  });
}
