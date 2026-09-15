import fs from 'fs';
const url=process.env.SUPABASE_URL, key=process.env.SUPABASE_SERVICE_ROLE_KEY;
if(!url||!key) throw new Error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
const products=JSON.parse(fs.readFileSync(new URL('../data-source/products-seed.json', import.meta.url)));
const rows=products.map(p=>({id:p.id,title:p.title,slug:p.slug,src_url:p.srcUrl,gallery:p.gallery,price:p.price,discount:p.discount,rating:p.rating,review_count:p.reviewCount,category:p.category,gender:p.gender,color:p.color,sizes:p.sizes,description:p.description,details:p.details,faqs:p.faqs,reviews:p.reviews,source_page:p.sourcePage,source_id:p.sourceId,source_description:p.sourceDescription,stock:20,cost_price:Math.round(p.price*.55),is_active:true,updated_at:new Date().toISOString()}));
const r=await fetch(`${url}/rest/v1/products`,{method:'POST',headers:{apikey:key,Authorization:`Bearer ${key}`,'Content-Type':'application/json',Prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify(rows)});
if(!r.ok) throw new Error(await r.text()); console.log(`Seeded ${rows.length} products`);
