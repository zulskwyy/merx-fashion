"use client";
import { cn } from "@/lib/utils";
import { integralCF } from "@/styles/fonts";
import Link from "next/link";
import React, { useState } from "react";
import { NavMenu } from "../navbar.types";
import { MenuList } from "./MenuList";
import { NavigationMenu, NavigationMenuList } from "@/components/ui/navigation-menu";
import { MenuItem } from "./MenuItem";
import Image from "next/image";
import SearchBox from "./SearchBox";
import ResTopNavbar from "./ResTopNavbar";
import CartBtn from "./CartBtn";
import { useI18n } from "@/lib/i18n";
import { useStoreSettings } from "@/lib/store-settings";

const data: NavMenu = [
  {id:1,label:"Shop",type:"MenuList",children:[
    {id:11,label:"Pakaian pria",url:"/shop?gender=Men",description:"Pilihan untuk tampilan sehari-hari dan rapi."},
    {id:12,label:"Pakaian wanita",url:"/shop?gender=Women",description:"Potongan yang nyaman dengan gaya yang tenang."},
    {id:13,label:"Pakaian unisex",url:"/shop?gender=Unisex",description:"Model serbaguna untuk berbagai gaya."},
    {id:14,label:"Semua produk",url:"/shop",description:"Lihat seluruh koleksi MERX."},
  ]},
  {id:2,type:"MenuItem",label:"Sale",url:"/shop?sort=low",children:[]},
  {id:3,type:"MenuItem",label:"New Arrivals",url:"/shop?sort=new",children:[]},
  {id:4,type:"MenuItem",label:"About",url:"/shop",children:[]},
];

export default function TopNavbar(){
  const {t}=useI18n(); const settings=useStoreSettings();
  const [mobileSearch, setMobileSearch] = useState(false);
  const labels: Record<number,string>={1:t("shop"),2:t("sale"),3:t("newArrivals"),4:t("about")};
  const localized=data.map(item=>({...item,label:labels[item.id]||item.label,children:item.children.map(c=>({...c,label:c.id===11?(t("gender")+" pria"):c.id===12?(t("gender")+" wanita"):c.id===13?(t("gender")+" unisex"):t("viewAll")}))}));
  return <nav className="sticky top-0 bg-white z-20 border-b border-black/5">
    <div className="flex relative max-w-frame mx-auto items-center justify-between md:justify-start py-5 md:py-6 px-4 xl:px-0">
      <div className="flex items-center"><div className="block md:hidden mr-4"><ResTopNavbar data={localized}/></div><Link href="/" className={cn(integralCF.className,"text-2xl lg:text-[32px] mb-2 mr-3 lg:mr-10")} style={{color:settings.primaryColor}}>{settings.storeName}</Link></div>
      <NavigationMenu className="hidden md:flex mr-2 lg:mr-7"><NavigationMenuList>{localized.map(item=><React.Fragment key={item.id}>{item.type==="MenuItem"?<MenuItem label={item.label} url={item.url}/>:<MenuList data={item.children} label={item.label}/>}</React.Fragment>)}</NavigationMenuList></NavigationMenu>
      <SearchBox/>
      <div className="flex items-center ml-2">
        <button type="button" aria-label={t("search")} onClick={()=>setMobileSearch((v)=>!v)} className="block md:hidden mr-2 p-1">
          <Image src="/icons/search-black.svg" height={22} width={22} alt=""/>
        </button>
        <CartBtn/>
        <Link href="/account" className="p-1 text-sm font-medium">{t("account")}</Link>
      </div>
      {mobileSearch && <div className="absolute left-4 right-4 top-full z-30 border-b border-black/10 bg-white px-0 py-3 md:hidden"><SearchBox mobile/></div>}
    </div>
  </nav>
}
