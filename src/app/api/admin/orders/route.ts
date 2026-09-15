import { NextResponse } from "next/server";
import { getAdminEmail } from "@/lib/server/admin-auth";
import { dbConfigured, supabaseRequest } from "@/lib/server/supabase";
export async function GET(){if(!getAdminEmail())return NextResponse.json({error:"Unauthorized"},{status:401});if(!dbConfigured)return NextResponse.json([]);const rows=await supabaseRequest("orders?select=*&order=created_at.desc&limit=100");return NextResponse.json(rows);}
