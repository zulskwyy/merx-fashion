"use client";
import React from "react";
import { addToCart } from "@/lib/features/carts/cartsSlice";
import { useAppDispatch } from "@/lib/hooks/redux";
import { Product } from "@/types/product.types";
export default function AddToCartBtn({data,quantity,size,color}:{data:Product;quantity:number;size:string;color:string}){const dispatch=useAppDispatch(); return <button type="button" className="bg-[#1B2A4A] w-full ml-3 sm:ml-5 h-11 md:h-[52px] text-xs sm:text-sm tracking-[0.15em] uppercase text-white hover:bg-[#1B2A4A]/85 transition-all" onClick={()=>dispatch(addToCart({id:data.id,name:data.title,srcUrl:data.srcUrl,price:data.price,attributes:[size,color],discount:data.discount,quantity}))}>Add to Cart</button>}
