import { NextResponse } from "next/server";
import { dbConfigured, supabaseRequest } from "@/lib/server/supabase";
import { adminBody, adminTable } from "@/lib/server/admin-scope";
export async function POST(req:Request){ if(!dbConfigured)return NextResponse.json({ok:false}); const b=await req.json(); if(!b?.productId||!b?.event)return NextResponse.json({error:"Invalid event"},{status:400}); try{await supabaseRequest(adminTable("wishlist_events"),{method:"POST",headers:{Prefer:"return=minimal"},body:JSON.stringify(adminBody({product_id:Number(b.productId),event_type:b.event,user_key:String(b.userKey||"anonymous"),created_at:new Date().toISOString()}))}); return NextResponse.json({ok:true});}catch{return NextResponse.json({ok:false});} }
