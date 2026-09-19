import { NextResponse } from "next/server";
import { clearCustomerSessionCookie } from "@/lib/server/customer-auth";

export async function POST() {
  await clearCustomerSessionCookie();
  return NextResponse.json({ ok: true });
}
