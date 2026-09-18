import crypto from "crypto";
import { cookies } from "next/headers";

const COOKIE = "merx_admin_session";
const ttl = 60 * 60 * 24 * 30;

function sign(value: string) {
  return crypto
    .createHmac("sha256", process.env.MERX_ADMIN_SECRET || "change-me")
    .update(value)
    .digest("hex");
}

function token(email: string) {
  return `${email}.${sign(email)}`;
}

function cookieOptions(maxAge = ttl) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

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
  cookies().set(COOKIE, token(email), cookieOptions());
}

export function refreshAdminCookie(email: string) {
  cookies().set(COOKIE, token(email), cookieOptions());
}

export function clearAdminCookie() {
  cookies().set(COOKIE, "", cookieOptions(0));
}

export function getAdminEmail() {
  const value = cookies().get(COOKIE)?.value || "";
  const separator = value.lastIndexOf(".");
  if (separator <= 0 || !process.env.MERX_ADMIN_SECRET) return null;
  const email = value.slice(0, separator);
  const signature = value.slice(separator + 1);
  if (!email || !signature) return null;
  return sign(email) === signature ? email : null;
}
