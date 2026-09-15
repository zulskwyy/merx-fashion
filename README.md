# MERX — updated catalog + checkout

This revision converts the original starter storefront into a 50-product MERX catalog driven by the supplied `50_foto_baju.csv`. Each CSV row is represented as a separate product entry with a distinct title, image URL, category, color, pricing, product details, FAQs, rating, and demo review content.

## Run

```bash
npm install
npm run dev
```

## Customer + checkout

`/account` stores the signed-up customer locally so checkout can reuse the name/email. `/checkout` is explicitly **test mode**: it records an order and does not charge a real card or wallet.

To send receipt emails automatically, create environment variables in `.env.local`:

```env
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=orders@your-verified-domain.com
```

Without those credentials, the order still completes in test mode, but the receipt email is reported as pending setup.

## Source data note

The product images use the Direct Image URLs provided in the user's CSV, so the 50 JPG files do not need to be bundled into the project. Review text and ratings in this demo are placeholder content for staging and should be replaced with real customer data before production. Exact fabric composition is intentionally not invented when it was not present in the source data.

## MERX Admin Studio + Database

Versi ini menambahkan `/admin` untuk mengelola produk, stok, harga, modal, diskon, pesanan, identitas toko, warna, hero, dan ringkasan analitik.

### Database production

Gunakan Supabase/Postgres. Jalankan `supabase/schema.sql` pada SQL Editor database. Setelah itu seed 50 produk awal dengan:

`npm run db:seed`

dengan environment `SUPABASE_URL` dan `SUPABASE_SERVICE_ROLE_KEY`.

### Environment Variables Vercel

`SUPABASE_URL`
`SUPABASE_SERVICE_ROLE_KEY`
`MERX_ADMIN_EMAIL`
`MERX_ADMIN_PASSWORD`
`MERX_ADMIN_SECRET`

Opsional untuk email receipt:

`RESEND_API_KEY`
`RESEND_FROM_EMAIL`

Jangan pernah menaruh service role key atau password admin di source code atau `NEXT_PUBLIC_*`.

### Admin

Buka `/admin`, masuk memakai credential admin dari environment. Admin memiliki dashboard pendapatan, modal, keuntungan, jumlah order, rekomendasi berdasarkan checkout dan simpan, peringatan stok rendah, editor produk, aturan diskon stok, daftar pesanan, dan pengaturan toko.
