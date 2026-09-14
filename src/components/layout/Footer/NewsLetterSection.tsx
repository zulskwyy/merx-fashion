"use client";
import { Button } from "@/components/ui/button";
import InputGroup from "@/components/ui/input-group";
import { cn } from "@/lib/utils";
import { integralCF } from "@/styles/fonts";
import Image from "next/image";
import React,{useState} from "react";
export default function NewsLetterSection(){const [email,setEmail]=useState("");const [done,setDone]=useState(false);const submit=()=>{if(!email.includes("@"))return;setDone(true)};return <div className="relative grid grid-cols-1 md:grid-cols-2 py-9 md:py-11 px-6 md:px-16 max-w-frame mx-auto bg-[#1B2A4A]"><p className={cn(integralCF.className,"font-bold text-[32px] md:text-[40px] text-white mb-9 md:mb-0")}>STAY UP TO DATE ABOUT OUR LATEST OFFERS</p><div className="flex items-center"><div className="flex flex-col w-full max-w-[349px] mx-auto"><InputGroup className="flex bg-white mb-[14px]"><InputGroup.Text><Image priority src="/icons/envelope.svg" height={20} width={20} alt="email" className="min-w-5 min-h-5"/></InputGroup.Text><InputGroup.Input value={email} onChange={e=>{setEmail(e.target.value);setDone(false)}} type="email" name="email" placeholder="Enter your email address" className="bg-transparent placeholder:text-black/40 placeholder:text-sm sm:placeholder:text-base"/></InputGroup><Button variant="secondary" onClick={submit} className="text-sm sm:text-base font-medium bg-white h-12 px-4 py-3" type="button">{done?"Subscribed":"Subscribe to Newsletter"}</Button></div></div></div>}
