"use client";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import React,{useState} from "react";
export default function TopBanner(){const [open,setOpen]=useState(true);if(!open)return null;return <div className="bg-[#1B2A4A] text-[#D4C4A8] text-center py-2 px-2 sm:px-4 xl:px-0"><div className="relative max-w-frame mx-auto"><p className="text-xs sm:text-sm">Sign up and get 10% off to your first order. <Link href="/account" className="underline font-medium text-white">Sign Up Now</Link></p><Button variant="ghost" className="hover:bg-transparent absolute right-0 top-1/2 -translate-y-1/2 w-fit h-fit p-1 hidden sm:flex" size="icon" type="button" aria-label="close banner" onClick={()=>setOpen(false)}><Image priority src="/icons/times.svg" height={13} width={13} alt="close banner"/></Button></div></div>}
