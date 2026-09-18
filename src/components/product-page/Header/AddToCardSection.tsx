"use client";
import CartCounter from "@/components/ui/CartCounter";
import React,{useState} from "react";
import AddToCartBtn from "./AddToCartBtn";
import {Product} from "@/types/product.types";
export default function AddToCardSection({data,size,color}:{data:Product;size:string;color:string}){const [quantity,setQuantity]=useState(1); return <div className="fixed md:relative w-full bg-white border-t md:border-none border-black/5 bottom-0 left-0 p-4 md:p-0 z-10 flex items-center justify-between sm:justify-start md:justify-center"><CartCounter initialValue={1} onAdd={v=>setQuantity(v)} onRemove={v=>setQuantity(Math.max(1,v))}/><AddToCartBtn data={data} quantity={quantity} size={size} color={color}/></div>}
