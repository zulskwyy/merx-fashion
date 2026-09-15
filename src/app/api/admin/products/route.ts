import { NextResponse } from "next/server";
import { getAdminEmail } from "@/lib/server/admin-auth";
import { products } from "@/data/products";
import { dbConfigured, supabaseRequest } from "@/lib/server/supabase";

function guard() { if (!getAdminEmail()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); if (!dbConfigured) return NextResponse.json({ error: "Database belum dikonfigurasi." }, { status: 503 }); return null; }
export async function GET() { const denied=guard(); if(denied)return denied; const rows=await supabaseRequest<any[]>("products?select=*&order=id.asc&limit=500"); return NextResponse.json(rows); }
export async function POST(req:Request) {
  const denied=guard(); if(denied)return denied;
  const body=await req.json();
  const row={id: Number(body.id || Date.now()),title:body.title||"Produk Baru",slug: body.slug || String(body.title||"produk").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,""),src_url:body.srcUrl||body.src_url||"/images/header-homepage.png",gallery:body.gallery||[body.srcUrl||body.src_url||"/images/header-homepage.png"],price:Number(body.price||0),discount: body.discount || {amount:0,percentage:0},rating:Number(body.rating||0),review_count:Number(body.reviewCount||0),category:body.category||"T-Shirts",gender:body.gender||"Unisex",color:body.color||"White",sizes:body.sizes||["S","M","L"],description:body.description||"",details:body.details||{},faqs:body.faqs||[],reviews:body.reviews||[],source_page:body.sourcePage||"",source_id:body.sourceId||String(body.id||Date.now()),source_description:body.sourceDescription||"",stock:Number(body.stock||0),cost_price:Number(body.costPrice||body.cost_price||Math.round(Number(body.price||0)*0.55)),is_active:body.isActive!==false,updated_at:new Date().toISOString()};
  const data=await supabaseRequest("products",{method:"POST",headers:{Prefer:"return=representation"},body:JSON.stringify(row)}); return NextResponse.json(data);
}
export async function PATCH(req:Request) {
  const denied=guard(); if(denied)return denied;
  const body=await req.json(); const id=Number(body.id); if(!id)return NextResponse.json({error:"ID produk tidak valid"},{status:400});
  const updates={title:body.title,slug:body.slug,src_url:body.srcUrl,gallery:body.gallery,price:Number(body.price),discount:body.discount,category:body.category,gender:body.gender,color:body.color,sizes:body.sizes,description:body.description,details:body.details,faqs:body.faqs,reviews:body.reviews,rating:Number(body.rating||0),review_count:Number(body.reviewCount||0),stock:Number(body.stock||0),cost_price:Number(body.costPrice||0),is_active:body.isActive!==false,updated_at:new Date().toISOString()};
  const data=await supabaseRequest(`products?id=eq.${id}`,{method:"PATCH",headers:{Prefer:"return=representation"},body:JSON.stringify(updates)}); return NextResponse.json(data);
}
export async function DELETE(req:Request) { const denied=guard(); if(denied)return denied; const {id}=await req.json(); await supabaseRequest(`products?id=eq.${Number(id)}`,{method:"DELETE"}); return NextResponse.json({ok:true}); }
