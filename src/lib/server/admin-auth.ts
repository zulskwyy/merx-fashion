import crypto from "crypto";
import { cookies } from "next/headers";

const COOKIE = "merx_admin_session";
const DEMO_COOKIE = "merx_demo_session";
const ttl = 60 * 60 * 24 * 30;
const demoTtl = 60 * 60 * 24;

function secret() {
  return process.env.MERX_ADMIN_SECRET || "change-me";
}

function sign(value: string) {
  return crypto.createHmac("sha256", secret()).update(value).digest("hex");
}

function timingSafeEqualHex(a: string, b: string) {
  if (a.length !== b.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(a, "hex"), Buffer.from(b, "hex"));
  } catch {
    return false;
  }
}

function token(email: string) {
  return `${email}.${sign(email)}`;
}

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

export type AdminContext =
  | { mode: "live"; email: string; workspaceId: null }
  | { mode: "demo"; email: "demo@merx.local"; workspaceId: string };

export function isAdminConfigured() {
  return Boolean(
    process.env.MERX_ADMIN_EMAIL &&
      process.env.MERX_ADMIN_PASSWORD &&
      process.env.MERX_ADMIN_SECRET,
  );
}

export function validAdmin(email: string, password: string) {
  return (
    email.trim().toLowerCase() ===
      (process.env.MERX_ADMIN_EMAIL || "").trim().toLowerCase() &&
    password === (process.env.MERX_ADMIN_PASSWORD || "")
  );
}

export function setAdminCookie(email: string) {
  const c = cookies();
  c.set(COOKIE, token(email), cookieOptions(ttl));
  c.set(DEMO_COOKIE, "", cookieOptions(0));
}

export function refreshAdminCookie(email: string) {
  cookies().set(COOKIE, token(email), cookieOptions(ttl));
}

export function clearAdminCookie() {
  const c = cookies();
  c.set(COOKIE, "", cookieOptions(0));
  c.set(DEMO_COOKIE, "", cookieOptions(0));
}

export function setDemoCookie(workspaceId: string) {
  if (!process.env.MERX_ADMIN_SECRET) throw new Error("MERX_ADMIN_SECRET wajib dikonfigurasi untuk Demo Admin.");
  const exp = Math.floor(Date.now() / 1000) + demoTtl;
  const payload = `${workspaceId}.${exp}`;
  const c = cookies();
  c.set(DEMO_COOKIE, `${payload}.${sign(`demo:${payload}`)}`, cookieOptions(demoTtl));
  c.set(COOKIE, "", cookieOptions(0));
}

export function clearDemoCookie() {
  cookies().set(DEMO_COOKIE, "", cookieOptions(0));
}

export function getDemoWorkspaceId() {
  if (!process.env.MERX_ADMIN_SECRET) return null;
  const value = cookies().get(DEMO_COOKIE)?.value || "";
  const parts = value.split(".");
  if (parts.length !== 3) return null;
  const [workspaceId, expRaw, signature] = parts;
  const exp = Number(expRaw);
  if (!workspaceId || !Number.isFinite(exp) || exp <= Math.floor(Date.now() / 1000) || !signature) return null;
  if (!timingSafeEqualHex(sign(`demo:${workspaceId}.${exp}`), signature)) return null;
  return workspaceId;
}

function getLiveAdminEmail() {
  const value = cookies().get(COOKIE)?.value || "";
  const separator = value.lastIndexOf(".");
  if (separator <= 0 || !process.env.MERX_ADMIN_SECRET) return null;
  const email = value.slice(0, separator);
  const signature = value.slice(separator + 1);
  if (!email || !signature) return null;
  return timingSafeEqualHex(sign(email), signature) ? email : null;
}

export function getAdminContext(): AdminContext | null {
  const workspaceId = getDemoWorkspaceId();
  if (workspaceId) return { mode: "demo", email: "demo@merx.local", workspaceId };
  const email = getLiveAdminEmail();
  return email ? { mode: "live", email, workspaceId: null } : null;
}

export function isDemoAdmin() {
  return getDemoWorkspaceId() !== null;
}

export function getAdminEmail() {
  return getAdminContext()?.email || null;
}
