import { NextResponse } from "next/server";
import { products } from "@/data/products";
import { dbConfigured, supabaseRequest } from "@/lib/server/supabase";
function normalize(r:any){return {...r,srcUrl:r.src_url,reviewCount:r.review_count,costPrice:r.cost_price,isActive:r.is_active,sourcePage:r.source_page,sourceId:r.source_id,sourceDescription:r.source_description};}
export async function GET(){
  if(!dbConfigured)return NextResponse.json(products);
  try{const rows=await supabaseRequest<any[]>("products?select=*&is_active=eq.true&order=id.asc&limit=500");return NextResponse.json(rows?.length?rows.map(normalize):products);}catch{return NextResponse.json(products);}
}
