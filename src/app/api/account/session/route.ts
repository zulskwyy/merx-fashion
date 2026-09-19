import { NextResponse } from "next/server";
import { getCustomerAccountById, getCustomerSession } from "@/lib/server/customer-auth";

export async function GET() {
  try {
    const session = await getCustomerSession();
    if (!session) return NextResponse.json({ user: null });
    const user = await getCustomerAccountById(session.id);
    if (!user) return NextResponse.json({ user: null }, { status: 401 });
    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Session tidak valid." }, { status: 500 });
  }
}
