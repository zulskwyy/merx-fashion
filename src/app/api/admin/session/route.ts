import { NextResponse } from "next/server";
import { getAdminEmail, isAdminConfigured } from "@/lib/server/admin-auth";
export async function GET() { const email = getAdminEmail(); return NextResponse.json({ authenticated: Boolean(email), configured: isAdminConfigured(), email }); }
