import { NextResponse } from "next/server";
import { dbConfigured, supabaseRequest } from "@/lib/server/supabase";
import { calculateTax, discountedPrice, resolveTaxRate } from "@/lib/catalog";

function esc(s:string){return String(s||"").replace(/[&<>\"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]||c));}

export async function POST(req:Request){
  try{
    const body=await req.json();
    const {customer,items,payment,lang="id"}=body||{};
    if(!customer?.name||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer?.email||"")||!Array.isArray(items)||!items.length)
      return NextResponse.json({error:"Data checkout tidak valid"},{status:400});

    const orderId=`MERX-${Date.now().toString(36).toUpperCase()}`;
    let emailSent=false;
    let subtotal=0;
    let productDiscount=0;
    let merchandiseTotal=0;
    let taxTotal=0;
    let shippingFee=0;
    let grandTotal=0;
    const taxBreakdown:any[]=[];

    if(dbConfigured){
      try{
        const ids=items.map((i:any)=>Number(i.id)).filter(Boolean);
        const dbProducts=ids.length?await supabaseRequest<any[]>(`products?select=id,title,price,discount,tax,cost_price,stock&id=in.(${ids.join(",")})&limit=500`):[];
        const settingsRows=await supabaseRequest<any[]>("store_settings?select=commerce_settings&id=eq.1&limit=1");
        const commerce=settingsRows?.[0]?.commerce_settings||{};
        const defaultTaxRate=Math.max(0,Math.min(100,Number(commerce.taxRate??11)));
        shippingFee=Math.max(0,Math.round(Number(commerce.shippingFee??0)));
        let costTotal=0;
        const itemRows:any[]=[];

        for(const item of items){
          const p=dbProducts.find((x:any)=>Number(x.id)===Number(item.id));
          if(!p) return NextResponse.json({error:`Produk ${item.id} tidak ditemukan.`},{status:404});
          const qty=Math.max(1,Number(item.quantity)||1);
          if(Number(p.stock)<qty) return NextResponse.json({error:`Stok ${p.title} tidak mencukupi.`},{status:409});
          const unitPrice=Math.max(0,Number(p.price||0));
          const salePrice=discountedPrice({price:unitPrice,discount:p.discount||{amount:0,percentage:0}} as any);
          const lineBase=unitPrice*qty;
          const lineSale=salePrice*qty;
          const rate=resolveTaxRate(p.tax,defaultTaxRate);
          const lineTax=calculateTax(lineSale,rate);
          subtotal+=lineBase;
          merchandiseTotal+=lineSale;
          taxTotal+=lineTax;
          productDiscount+=Math.max(0,lineBase-lineSale);
          costTotal+=Number(p.cost_price||0)*qty;
          taxBreakdown.push({productId:Number(p.id),title:p.title,rate,tax:lineTax});
          itemRows.push({order_id:null,product_id:Number(p.id),title:String(p.title),quantity:qty,unit_price:salePrice,cost_price:Number(p.cost_price||0)});
        }

        grandTotal=Math.max(0,Math.round(merchandiseTotal+shippingFee+taxTotal));
        const orderRows=await supabaseRequest<any[]>("orders",{
          method:"POST",
          headers:{Prefer:"return=representation"},
          body:JSON.stringify({
            order_code:orderId,
            customer_name:customer.name,
            customer_email:customer.email,
            phone:customer.phone||"",
            address:customer.address||"",
            payment_method:payment||"card",
            status:"paid",
            subtotal:Math.round(merchandiseTotal),
            tax_total:Math.round(taxTotal),
            total:grandTotal,
            cost_total:Math.round(costTotal),
            shipping:{mode:"checkout",shippingFee,calculatedAt:new Date().toISOString()},
            delivery_status:"pending",
          })
        });
        const dbOrderId=orderRows?.[0]?.id;
        const finalItems=itemRows.map(r=>({...r,order_id:dbOrderId}));
        await supabaseRequest("order_items",{method:"POST",headers:{Prefer:"return=minimal"},body:JSON.stringify(finalItems)});
        for(const item of finalItems){
          const p=dbProducts.find((x:any)=>Number(x.id)===item.product_id);
          if(p) await supabaseRequest(`products?id=eq.${item.product_id}`,{method:"PATCH",headers:{Prefer:"return=minimal"},body:JSON.stringify({stock:Math.max(0,Number(p.stock)-item.quantity),updated_at:new Date().toISOString()})});
        }
      }catch(err){
        return NextResponse.json({error:err instanceof Error?err.message:"Gagal menyimpan pesanan ke database"},{status:500});
      }
    }else{
      const clientItems=items as any[];
      subtotal=clientItems.reduce((s,i)=>s+Math.max(0,Number(i.price||0))*Math.max(1,Number(i.quantity)||1),0);
      merchandiseTotal=clientItems.reduce((s,i)=>s+discountedPrice(i)*Math.max(1,Number(i.quantity)||1),0);
      productDiscount=Math.max(0,subtotal-merchandiseTotal);
      grandTotal=merchandiseTotal+shippingFee;
    }

    const apiKey=process.env.RESEND_API_KEY;
    const from=process.env.RESEND_FROM_EMAIL;
    if(apiKey&&from){
      const id=lang==="id";
      const html=`<div style="font-family:Arial,sans-serif;max-width:640px;margin:auto"><h1>MERX ${id?'Bukti Pembayaran':'Payment Receipt'}</h1><p>${id?'Halo':'Hi'} ${esc(customer.name)}, ${id?'pembayaran kamu sudah dikonfirmasi.':'your payment has been confirmed.'}</p><p><b>${id?'Pesanan':'Order'}:</b> ${orderId}</p><p><b>${id?'Metode':'Method'}:</b> ${esc(payment||'card')}</p><p><b>Subtotal:</b> Rp ${Number(merchandiseTotal).toLocaleString('id-ID')}</p><p><b>${id?'Pajak':'Tax'}:</b> Rp ${Number(taxTotal).toLocaleString('id-ID')}</p><p><b>${id?'Pengiriman':'Shipping'}:</b> Rp ${Number(shippingFee).toLocaleString('id-ID')}</p><p><b>Total:</b> Rp ${Number(grandTotal).toLocaleString('id-ID')}</p><ul>${items.map((i:any)=>`<li>${esc(i.name)} × ${Number(i.quantity)||1}</li>`).join('')}</ul></div>`;
      const r=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${apiKey}`,"Content-Type":"application/json"},body:JSON.stringify({from,to:[customer.email],subject:`MERX ${id?"Bukti Pembayaran":"Receipt"} ${orderId}`,html})});
      emailSent=r.ok;
    }

    return NextResponse.json({orderId,emailSent,subtotal,productDiscount,merchandiseTotal,shippingFee,taxTotal,total:grandTotal,taxBreakdown},{status:200});
  }catch{return NextResponse.json({error:"Tidak dapat memproses checkout"},{status:500});}
}
