import crypto from "crypto";
import { NextResponse } from "next/server";
import { setDemoCookie } from "@/lib/server/admin-auth";
import { dbConfigured, supabaseRequest } from "@/lib/server/supabase";
import { products } from "@/data/products";

const DAY = 24 * 60 * 60 * 1000;

function money(n: number) { return Math.max(0, Math.round(Number(n || 0))); }
function salePrice(p: any) {
  const d = p.discount || {};
  if (Number(d.percentage || 0) > 0) return Math.round(p.price - (p.price * Number(d.percentage)) / 100);
  if (Number(d.amount || 0) > 0) return Math.max(0, p.price - Number(d.amount));
  return Number(p.price || 0);
}

export async function POST() {
  if (!dbConfigured) return NextResponse.json({ error: "Database belum dikonfigurasi untuk Demo Admin." }, { status: 503 });
  try {
    // Opportunistic cleanup so public demos do not accumulate forever.
    const nowIso = new Date().toISOString();
    await supabaseRequest(`demo_workspaces?expires_at=lt.${encodeURIComponent(nowIso)}`, { method: "DELETE" }).catch(() => null);
    const active = await supabaseRequest<any[]>(`demo_workspaces?select=id&expires_at=gt.${encodeURIComponent(nowIso)}&limit=101`).catch(() => []);
    if ((active || []).length >= 100) return NextResponse.json({ error: "Demo sedang penuh. Coba lagi beberapa saat lagi." }, { status: 429 });

    const workspaceId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + DAY).toISOString();
    await supabaseRequest("demo_workspaces", {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({ id: workspaceId, label: "MERX Public Demo", expires_at: expiresAt }),
    });

    const now = new Date().toISOString();
    await supabaseRequest("demo_store_settings", {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({
        workspace_id: workspaceId,
        store_name: "MERX Demo Store",
        primary_color: "#1B2A4A",
        accent_color: "#F3EFE7",
        hero_title: "Demo Admin MERX",
        hero_description: "Sandbox terpisah untuk mencoba katalog, pesanan, pajak, ongkir, dan saldo.",
        hero_image_url: "/images/header-homepage.png",
        business: { phone: "", email: "demo@merx.local", whatsapp: "", address: "Sandbox Demo", instagram: "", shippingNote: "Demo only" },
        commerce_settings: { shippingFee: 15000, taxRate: 11 },
        updated_at: now,
      }),
    });

    await supabaseRequest("demo_discount_rules", {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({ workspace_id: workspaceId, name: "Stok menipis", enabled: true, stock_threshold: 5, percentage: 10, updated_at: now }),
    });

    const demoProducts = products.slice(0, 18).map((p: any) => ({
      workspace_id: workspaceId,
      title: p.title,
      slug: p.slug,
      src_url: p.srcUrl,
      gallery: p.gallery || [],
      price: money(p.price),
      tax: { mode: "auto", rate: null },
      discount: { amount: 0, percentage: 0, source: "manual" },
      pricing: { mode: "manual", target: 0 },
      rating: Number(p.rating || 0),
      review_count: Number(p.reviewCount || 0),
      category: p.category || "Other",
      gender: p.gender || "Unisex",
      color: p.color || "Default",
      sizes: p.sizes || [],
      description: p.description || "",
      details: p.details || {},
      faqs: p.faqs || [],
      reviews: p.reviews || [],
      source_page: p.sourcePage || "",
      source_id: p.sourceId || String(p.id),
      source_description: p.sourceDescription || "",
      stock: 20,
      cost_price: money(p.price * 0.55),
      is_active: true,
      updated_at: now,
    }));

    const productRows = await supabaseRequest<any[]>("demo_products", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify(demoProducts),
    });

    const picked = (productRows || []).slice(0, 4);
    const shipping = 15000;
    const ordersSeed = [
      { index: 0, status: "paid", delivery_status: "pending", customer: "Demo Customer", email: "customer1@merx.local" },
      { index: 1, status: "shipped", delivery_status: "pending", customer: "Raka Demo", email: "customer2@merx.local" },
      { index: 2, status: "delivered", delivery_status: "delivered", customer: "Nadia Demo", email: "customer3@merx.local" },
    ];

    const orderRows = ordersSeed.map((o, i) => {
      const p = picked[o.index] || picked[0];
      const qty = i === 0 ? 1 : 2;
      const merchandise = money(salePrice(p) * qty);
      const tax = money(merchandise * 0.11);
      const cost = money(Number(p.cost_price || p.price * 0.55) * qty);
      return {
        workspace_id: workspaceId,
        order_code: `DEMO-${workspaceId.slice(0, 8).toUpperCase()}-${i + 1}`,
        customer_name: o.customer,
        customer_email: o.email,
        phone: "0812-0000-0000",
        address: "Alamat sandbox demo",
        payment_method: i === 1 ? "bank" : "ewallet",
        status: o.status,
        subtotal: merchandise,
        tax_total: tax,
        total: merchandise + tax + shipping,
        cost_total: cost,
        shipping: { mode: "checkout", shippingFee: shipping, calculatedAt: now },
        delivery_status: o.delivery_status,
        delivered_at: o.delivery_status === "delivered" ? now : null,
        other_cost: 0,
        created_at: new Date(Date.now() - i * 3 * 60 * 60 * 1000).toISOString(),
        updated_at: now,
      };
    });

    const createdOrders = await supabaseRequest<any[]>("demo_orders", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify(orderRows),
    });

    const itemRows: any[] = [];
    (createdOrders || []).forEach((o: any, i: number) => {
      const p = picked[i] || picked[0];
      const qty = i === 0 ? 1 : 2;
      itemRows.push({ workspace_id: workspaceId, order_id: o.id, product_id: p.id, title: p.title, quantity: qty, unit_price: money(salePrice(p)), cost_price: money(Number(p.cost_price || p.price * 0.55)) });
    });
    if (itemRows.length) {
      await supabaseRequest("demo_order_items", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify(itemRows) });
    }

    const credits = (createdOrders || []).reduce((sum: number, o: any) => sum + Number(o.total || 0), 0);
    const walletRow = await supabaseRequest<any[]>("demo_wallets", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({ workspace_id: workspaceId, balance: credits, updated_at: now }),
    });
    const walletId = walletRow?.[0]?.id;
    if (walletId) {
      const txs = (createdOrders || []).map((o: any) => ({ workspace_id: workspaceId, wallet_id: walletId, direction: "credit", transaction_type: "sale", amount: Number(o.total || 0), reference_key: `demo-order:${workspaceId}:${o.id}`, reference_type: "order", reference_id: String(o.id), method: "demo", note: "Pembayaran demo" }));
      await supabaseRequest("demo_wallet_transactions", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify(txs) });
    }

    await supabaseRequest("demo_wishlist_events", {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify(picked.slice(0, 3).map((p: any, i: number) => ({ workspace_id: workspaceId, product_id: p.id, user_key: `demo-user-${i + 1}`, event_type: "save" }))),
    });

    setDemoCookie(workspaceId);
    return NextResponse.json({ ok: true, mode: "demo", workspaceId });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Gagal membuat Demo Workspace." }, { status: 500 });
  }
}
