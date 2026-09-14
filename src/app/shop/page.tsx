"use client";
import React, { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "@/components/common/ProductCard";
import { products } from "@/data/products";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { FiSliders, FiX } from "react-icons/fi";
import Link from "next/link";

const PAGE_SIZE=12;
export default function ShopPage(){
 const params=useSearchParams(); const q=params.get("q")||""; const initialCategory=params.get("category")||"All";
 const [query,setQuery]=useState(q); const [category,setCategory]=useState(initialCategory); const [color,setColor]=useState("All"); const [gender,setGender]=useState("All"); const [sort,setSort]=useState(params.get("sort")==="new"?"new":params.get("sort")==="popular"?"popular":"popular"); const [page,setPage]=useState(1); const [open,setOpen]=useState(false);
 const categories=["All",...Array.from(new Set(products.map(p=>p.category)))]; const colors=["All",...Array.from(new Set(products.map(p=>p.color)))]; const genders=["All",...Array.from(new Set(products.map(p=>p.gender)))];
 const filtered=useMemo(()=>{ let out=products.filter(p=>{const hay=`${p.title} ${p.category} ${p.color} ${p.gender}`.toLowerCase(); return (!query||hay.includes(query.toLowerCase()))&&(category==="All"||p.category===category)&&(color==="All"||p.color===color)&&(gender==="All"||p.gender===gender)}); if(sort==="low") out.sort((a,b)=>a.price-b.price); if(sort==="high") out.sort((a,b)=>b.price-a.price); if(sort==="new") out.sort((a,b)=>a.id-b.id); if(sort==="popular") out.sort((a,b)=>b.rating-a.rating); return out;},[query,category,color,gender,sort]);
 const totalPages=Math.max(1,Math.ceil(filtered.length/PAGE_SIZE)); const shown=filtered.slice((page-1)*PAGE_SIZE,page*PAGE_SIZE);
 const reset=()=>{setQuery("");setCategory("All");setColor("All");setGender("All");setPage(1);};
 const FilterPanel=()=> <div className="space-y-6"><div><div className="flex items-center justify-between mb-4"><b className="text-lg">Filters</b><FiSliders className="text-black/40"/></div><label className="block text-sm mb-2">Search</label><input value={query} onChange={e=>{setQuery(e.target.value);setPage(1)}} placeholder="T-shirts, polo..." className="w-full rounded-xl bg-[#F3EFE7] border-0 px-4 py-3 outline-none"/></div>
 {[["Category",categories,category,setCategory],["Color",colors,color,setColor],["Gender",genders,gender,setGender]].map(([label,items,value,setter]:any)=><div key={label as string}><label className="block text-sm mb-2">{label as string}</label><select value={value as string} onChange={e=>{setter(e.target.value);setPage(1)}} className="w-full rounded-xl border border-black/10 px-4 py-3 bg-white">{(items as string[]).map(v=><option key={v}>{v}</option>)}</select></div>)}<Button type="button" onClick={reset} variant="outline" className="w-full">Reset filters</Button></div>;
 return <main className="pb-20"><div className="max-w-frame mx-auto px-4 xl:px-0"><hr className="h-[1px] border-t-black/10 mb-5"/><div className="flex items-center gap-2 text-sm text-black/50 mb-4"><Link href="/">Home</Link><span>/</span><span>Shop</span></div>
 <div className="flex items-center justify-between mb-7"><div><h1 className="font-bold text-3xl md:text-[40px]">Shop all</h1><p className="text-black/60 mt-1">{filtered.length} curated products from the supplied 50-photo collection.</p></div><Button className="md:hidden bg-[#1B2A4A]" onClick={()=>setOpen(true)}><FiSliders className="mr-2"/>Filters</Button></div>
 <div className="flex md:space-x-7 items-start"><aside className="hidden md:block min-w-[270px] max-w-[270px] border border-black/10 rounded-[20px] p-5"><FilterPanel/></aside><section className="flex flex-col w-full gap-6"><div className="flex flex-wrap items-center justify-between gap-3"><span className="text-sm text-black/60">Showing {filtered.length ? (page-1)*PAGE_SIZE+1:0}-{Math.min(page*PAGE_SIZE,filtered.length)} of {filtered.length}</span><div className="flex items-center gap-2">Sort by<Select value={sort} onValueChange={v=>{setSort(v);setPage(1)}}><SelectTrigger className="w-[160px] border-none bg-[#F3EFE7] rounded-full"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="popular">Most popular</SelectItem><SelectItem value="new">Newest</SelectItem><SelectItem value="low">Price: low to high</SelectItem><SelectItem value="high">Price: high to low</SelectItem></SelectContent></Select></div></div>
 <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">{shown.map(p=><ProductCard key={p.id} data={p}/>)}{shown.length===0&&<div className="col-span-full py-20 text-center text-black/50">No products match those filters.</div>}</div>
 <div className="flex items-center justify-center gap-2 pt-4">{Array.from({length:totalPages},(_,i)=>i+1).map(n=><Button key={n} variant={n===page?"default":"outline"} className={n===page?"bg-[#1B2A4A]":""} onClick={()=>setPage(n)}>{n}</Button>)}</div></section></div></div>
 {open&&<div className="fixed inset-0 z-50 md:hidden"><div className="absolute inset-0 bg-black/40" onClick={()=>setOpen(false)}/><div className="absolute right-0 top-0 h-full w-[88%] max-w-sm bg-white p-5 overflow-y-auto"><button onClick={()=>setOpen(false)} className="absolute right-4 top-4 p-2"><FiX/></button><div className="pt-10"><FilterPanel/></div></div></div>}
 </main>
}
