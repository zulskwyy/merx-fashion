import crypto from "crypto";
import { cookies } from "next/headers";

const COOKIE = "merx_admin_session";
const ttl = 60 * 60 * 12;

function sign(value: string) {
  return crypto.createHmac("sha256", process.env.MERX_ADMIN_SECRET || "change-me").update(value).digest("hex");
}
function token(email: string) { return `${email}.${sign(email)}`; }

export function isAdminConfigured() {
  return Boolean(process.env.MERX_ADMIN_EMAIL && process.env.MERX_ADMIN_PASSWORD && process.env.MERX_ADMIN_SECRET);
}

export function validAdmin(email: string, password: string) {
  return email.trim().toLowerCase() === (process.env.MERX_ADMIN_EMAIL || "").trim().toLowerCase() && password === (process.env.MERX_ADMIN_PASSWORD || "");
}

export function setAdminCookie(email: string) {
  cookies().set(COOKIE, token(email), { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: ttl });
}
export function clearAdminCookie() { cookies().set(COOKIE, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 0 }); }

export function getAdminEmail() {
  const value = cookies().get(COOKIE)?.value;
  if (!value) return null;
  const [email, signature] = value.split(".");
  if (!email || !signature || !process.env.MERX_ADMIN_SECRET) return null;
  return sign(email) === signature ? email : null;
}
