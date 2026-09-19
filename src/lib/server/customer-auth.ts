import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { dbConfigured, supabaseRequest } from "@/lib/server/supabase";

export const CUSTOMER_COOKIE = "merx_customer_session";
const SESSION_DEFAULT_SECONDS = 8 * 60 * 60;
const SESSION_REMEMBER_SECONDS = 30 * 24 * 60 * 60;

type CustomerSessionPayload = { id: number; exp: number };
export type CustomerAccount = { id: number; name: string; email: string };

function getCustomerSecret() {
  const secret = process.env.MERX_CUSTOMER_SECRET || process.env.MERX_ADMIN_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("MERX customer session secret belum dikonfigurasi dengan benar.");
  }
  return secret;
}

function base64url(input: Buffer | string) {
  return Buffer.from(input).toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function unbase64url(input: string) {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((input.length + 3) % 4);
  return Buffer.from(padded, "base64");
}

function signature(data: string) {
  return base64url(createHmac("sha256", getCustomerSecret()).update(data).digest());
}

export function createCustomerSessionToken(userId: number, remember = false) {
  const now = Math.floor(Date.now() / 1000);
  const maxAge = remember ? SESSION_REMEMBER_SECONDS : SESSION_DEFAULT_SECONDS;
  const payload = base64url(JSON.stringify({ id: userId, exp: now + maxAge } satisfies CustomerSessionPayload));
  return `${payload}.${signature(payload)}`;
}

export function verifyCustomerSessionToken(token: string | undefined): CustomerSessionPayload | null {
  if (!token) return null;
  const [payload, providedSignature] = token.split(".");
  if (!payload || !providedSignature) return null;
  try {
    const expected = signature(payload);
    const a = Buffer.from(providedSignature);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
    const data = JSON.parse(unbase64url(payload).toString("utf8")) as CustomerSessionPayload;
    if (!Number.isInteger(data.id) || data.id <= 0 || !Number.isFinite(data.exp) || data.exp <= Math.floor(Date.now() / 1000)) return null;
    return data;
  } catch {
    return null;
  }
}

export async function getCustomerSession() {
  const token = (await cookies()).get(CUSTOMER_COOKIE)?.value;
  return verifyCustomerSessionToken(token);
}

export async function getCustomerAccountById(id: number): Promise<CustomerAccount | null> {
  if (!dbConfigured) return null;
  const rows = await supabaseRequest<CustomerAccount[]>(`customer_accounts?select=id,name,email&id=eq.${id}&limit=1`);
  return rows?.[0] || null;
}

export async function setCustomerSessionCookie(userId: number, remember = false) {
  const maxAge = remember ? SESSION_REMEMBER_SECONDS : SESSION_DEFAULT_SECONDS;
  (await cookies()).set(CUSTOMER_COOKIE, createCustomerSessionToken(userId, remember), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge,
  });
}

export async function clearCustomerSessionCookie() {
  (await cookies()).set(CUSTOMER_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
