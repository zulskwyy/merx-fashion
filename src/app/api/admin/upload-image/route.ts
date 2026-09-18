import { NextResponse } from "next/server";
import { getAdminEmail } from "@/lib/server/admin-auth";

const BUCKET = "product-images";
function storageHeaders(key: string) { return { apikey: key, Authorization: `Bearer ${key}` }; }
function safeName(name: string) { return name.toLowerCase().replace(/[^a-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "") || "image"; }

export async function POST(req: Request) {
  if (!getAdminEmail()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const url = process.env.SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return NextResponse.json({ error: "Database belum dikonfigurasi." }, { status: 503 });
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "File gambar tidak ditemukan." }, { status: 400 });
    if (!file.type.startsWith("image/")) return NextResponse.json({ error: "File harus berupa gambar." }, { status: 400 });
    if (file.size > 8 * 1024 * 1024) return NextResponse.json({ error: "Ukuran gambar maksimal 8 MB." }, { status: 400 });

    const bucketCheck = await fetch(`${url}/storage/v1/bucket/${BUCKET}`, { headers: storageHeaders(key) });
    if (!bucketCheck.ok) {
      const bucketResponse = await fetch(`${url}/storage/v1/bucket`, {
        method: "POST",
        headers: { ...storageHeaders(key), "Content-Type": "application/json" },
        body: JSON.stringify({ id: BUCKET, name: BUCKET, public: true }),
      });
      if (!bucketResponse.ok && bucketResponse.status !== 409) {
        throw new Error((await bucketResponse.text()) || "Gagal menyiapkan storage gambar.");
      }
    }

    const path = `${new Date().toISOString().slice(0, 10)}/${Date.now()}-${safeName(file.name)}`;
    const uploadResponse = await fetch(`${url}/storage/v1/object/${BUCKET}/${path}`, {
      method: "POST",
      headers: { ...storageHeaders(key), "Content-Type": file.type, "x-upsert": "true" },
      body: Buffer.from(await file.arrayBuffer()),
    });
    if (!uploadResponse.ok) throw new Error((await uploadResponse.text()) || "Gagal mengunggah gambar.");
    return NextResponse.json({ url: `${url}/storage/v1/object/public/${BUCKET}/${path}` });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Gagal mengunggah gambar." }, { status: 500 });
  }
}
