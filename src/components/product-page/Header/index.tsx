"use client";
import React,{useState} from "react";
import PhotoSection from "./PhotoSection";
import {Product} from "@/types/product.types";
import {integralCF} from "@/styles/fonts";
import {cn} from "@/lib/utils";
import Rating from "@/components/ui/Rating";
import ColorSelection from "./ColorSelection";
import SizeSelection from "./SizeSelection";
import AddToCardSection from "./AddToCardSection";
import {discountedPrice,formatIDR} from "@/lib/catalog";
export default function Header({data}:{data:Product}){const [color,setColor]=useState(data.color);const [size,setSize]=useState(data.sizes[Math.min(2,data.sizes.length-1)]);const sale=discountedPrice(data);const colorOptions=[data.color]; return <div className="grid grid-cols-1 md:grid-cols-2 gap-5"><div><PhotoSection data={data}/></div><div><h1 className={cn(integralCF.className,"text-2xl md:text-[40px] md:leading-[40px] mb-3 md:mb-3.5 capitalize")}>{data.title}</h1><div className="flex items-center mb-3"><Rating initialValue={data.rating} allowFraction SVGclassName="inline-block" emptyClassName="fill-gray-50" size={25} readonly/><span className="text-black text-xs sm:text-sm ml-3">{data.rating.toFixed(1)}<span className="text-black/60">/5</span> <span className="text-black/40">({data.reviewCount} reviews)</span></span></div><div className="flex items-center gap-3 mb-5"><span className="font-bold text-black text-2xl sm:text-[32px]">{formatIDR(sale)}</span>{sale<data.price&&<><span className="font-bold text-black/40 line-through text-2xl sm:text-[32px]">{formatIDR(data.price)}</span><span className="font-medium text-xs py-1.5 px-3.5 rounded-full bg-[#7A1F2B]/10 text-[#7A1F2B]">-{data.discount.percentage}%</span></>}</div><p className="text-sm sm:text-base text-black/60 mb-5">{data.description}</p><hr className="border-t-black/10 mb-5"/><ColorSelection value={color} onChange={setColor} colors={colorOptions}/><hr className="border-t-black/10 my-5"/><SizeSelection value={size} onChange={setSize} sizes={data.sizes}/><hr className="hidden md:block border-t-black/10 my-5"/><AddToCardSection data={data} size={size} color={color}/></div></div>}
