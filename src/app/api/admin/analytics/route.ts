import { NextResponse } from "next/server";
import { getAdminEmail } from "@/lib/server/admin-auth";
import { dbConfigured, supabaseRequest } from "@/lib/server/supabase";
import { products } from "@/data/products";

function orderProfit(order: any) {
  const shippingCost = Number(order.shipping?.shippingCost || 0);
  return Number(order.total || 0) - Number(order.cost_total || 0) - shippingCost - Number(order.other_cost || 0);
}

export async function GET() {
  if (!getAdminEmail()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!dbConfigured) return NextResponse.json({ configured: false, revenue: 0, cost: 0, profit: 0, margin: 0, orders: 0, topCheckout: [], topSaved: [], lowStock: [] });
  try {
    const [orders, items, saves, lowStock] = await Promise.all([
      supabaseRequest<any[]>("orders?select=total,cost_total,other_cost,shipping,status,created_at&status=neq.cancelled&limit=5000"),
      supabaseRequest<any[]>("order_items?select=product_id,title,quantity,unit_price,cost_price&limit=5000"),
      supabaseRequest<any[]>("wishlist_events?select=product_id,event_type&event_type=eq.save&limit=5000"),
      supabaseRequest<any[]>("products?select=id,title,stock&stock=lte.5&order=stock.asc&limit=20"),
    ]);
    const revenue = (orders || []).reduce((sum: number, o: any) => sum + Number(o.total || 0) + Number(o.shipping?.shippingFee || 0), 0);
    const cost = (orders || []).reduce((sum: number, o: any) => sum + Number(o.cost_total || 0), 0);
    const extraCost = (orders || []).reduce((sum: number, o: any) => sum + Number(o.shipping?.shippingCost || 0) + Number(o.other_cost || 0), 0);
    const profit = revenue - cost - extraCost;
    const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
    const checkoutMap = (items || []).reduce((acc: any, r: any) => {
      const id = Number(r.product_id);
      acc[id] = { id, title: r.title, count: (acc[id]?.count || 0) + Number(r.quantity || 1) };
      return acc;
    }, {});
    const saveMap = (saves || []).reduce((acc: any, r: any) => {
      const id = Number(r.product_id);
      acc[id] = { id, count: (acc[id]?.count || 0) + 1 };
      return acc;
    }, {});
    const top = (map: any) => Object.values(map).sort((a: any, b: any) => b.count - a.count).slice(0, 10).map((r: any) => ({ ...r, title: products.find(p => p.id === r.id)?.title || r.title || `Produk ${r.id}` }));
    return NextResponse.json({
      configured: true,
      revenue,
      cost,
      extraCost,
      profit,
      margin,
      orders: (orders || []).length,
      topCheckout: top(checkoutMap),
      topSaved: top(saveMap),
      lowStock: lowStock || [],
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Analytics error" }, { status: 500 });
  }
}
