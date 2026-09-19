"use client";
import React,{useEffect,useState} from "react";
import {useI18n} from "@/lib/i18n";
import {Button} from "@/components/ui/button";

type User={id:number;name:string;email:string};

async function jsonRequest(url:string, init?:RequestInit){
  const res=await fetch(url,{...init,headers:{"Content-Type":"application/json",...(init?.headers||{})}});
  const data=await res.json().catch(()=>({}));
  if(!res.ok) throw new Error(data?.error||"Permintaan gagal.");
  return data;
}

export default function AccountPage(){
  const {t,lang,setLang}=useI18n();
  const [mode,setMode]=useState<"login"|"signup">("login");
  const [name,setName]=useState("");
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [remember,setRemember]=useState(false);
  const [saved,setSaved]=useState<User|null>(null);
  const [message,setMessage]=useState("");
  const [busy,setBusy]=useState(true);

  useEffect(()=>{
    let active=true;
    fetch("/api/account/session",{cache:"no-store"})
      .then(r=>r.json())
      .then(data=>{if(active&&data?.user){setSaved(data.user);setName(data.user.name||"");setEmail(data.user.email||"");}})
      .catch(()=>{})
      .finally(()=>{if(active)setBusy(false);});
    return()=>{active=false;};
  },[]);

  const submit=async(e:React.FormEvent)=>{
    e.preventDefault();setMessage("");
    const normalized=email.trim().toLowerCase();
    try{
      const endpoint=mode==="signup"?"/api/account/signup":"/api/account/login";
      const data=await jsonRequest(endpoint,{method:"POST",body:JSON.stringify({name:name.trim(),email:normalized,password,remember})});
      setSaved(data.user);setName(data.user.name||"");setEmail(data.user.email||"");setPassword("");setMessage(mode==="signup"?t("accountCreated"):t("signIn"));
    }catch(err){setMessage(err instanceof Error?err.message:t("invalidLogin"));}
  };

  const signout=async()=>{
    try{await jsonRequest("/api/account/logout",{method:"POST"});}catch{}
    setSaved(null);setPassword("");setMessage(t("signOut"));
  };

  const saveProfile=async(e:React.FormEvent)=>{
    e.preventDefault();if(!saved)return;setMessage("");
    try{
      const data=await jsonRequest("/api/account/profile",{method:"PATCH",body:JSON.stringify({name:name.trim()||saved.name})});
      setSaved(data.user);setName(data.user.name);setMessage(t("accountSaved"));
    }catch(err){setMessage(err instanceof Error?err.message:t("accountSaved"));}
  };

  if(busy) return <main className="min-h-[60vh] grid place-items-center px-4"><div className="text-sm text-black/50">Memuat akun…</div></main>;

  return <main className="pb-24"><div className="max-w-3xl mx-auto px-4 py-10"><div className="flex items-center justify-between gap-4 mb-8"><div><h1 className="text-3xl md:text-4xl font-bold">{t("customerAccount")}</h1><p className="text-black/60 mt-2">{saved?t("loggedInAs"):t("signIn")}</p></div><div className="flex rounded-xl border border-black/10 p-1"><button type="button" onClick={()=>setLang("id")} className={`px-4 py-2 rounded-lg text-sm ${lang==="id"?"bg-[#1B2A4A] text-white":""}`}>{t("indonesian")}</button><button type="button" onClick={()=>setLang("en")} className={`px-4 py-2 rounded-lg text-sm ${lang==="en"?"bg-[#1B2A4A] text-white":""}`}>{t("english")}</button></div></div>
 {saved?<div className="space-y-6"><form onSubmit={saveProfile} className="border border-black/10 rounded-2xl p-6 space-y-5"><h2 className="text-xl font-semibold">{t("account")}</h2><div><label className="block text-sm mb-2">{t("fullName")}</label><input value={name} onChange={e=>setName(e.target.value)} className="w-full border border-black/10 rounded-xl px-4 py-3"/></div><div><label className="block text-sm mb-2">{t("email")}</label><input value={saved.email} disabled className="w-full border border-black/10 rounded-xl px-4 py-3 bg-black/[.03]"/></div><Button className="bg-[#1B2A4A]" type="submit">{t("saveChanges")}</Button></form><div className="border border-black/10 rounded-2xl p-6"><h2 className="text-xl font-semibold mb-3">{t("language")}</h2><p className="text-sm text-black/60 mb-4">{lang==="id"?"Bahasa Indonesia":"English"}</p><div className="flex gap-3"><button type="button" onClick={()=>setLang("id")} className={`px-4 py-2 rounded-xl border ${lang==="id"?"border-[#1B2A4A] bg-[#F3EFE7]":"border-black/10"}`}>{t("indonesian")}</button><button type="button" onClick={()=>setLang("en")} className={`px-4 py-2 rounded-xl border ${lang==="en"?"border-[#1B2A4A] bg-[#F3EFE7]":"border-black/10"}`}>{t("english")}</button></div></div><div className="border border-black/10 rounded-2xl p-6 flex items-center justify-between gap-4"><div><h2 className="font-semibold">{t("signOut")}</h2><p className="text-sm text-black/60 mt-1">{t("signOutConfirm")}</p></div><Button type="button" variant="outline" onClick={signout}>{t("signOut")}</Button></div>{message&&<p className="text-sm text-black/60">{message}</p>}</div>:<form onSubmit={submit} className="border border-black/10 rounded-2xl p-6 space-y-5 max-w-lg"><div className="flex border-b border-black/10 mb-5"><button type="button" onClick={()=>setMode("login")} className={`flex-1 py-3 ${mode==="login"?"border-b-2 border-black font-semibold":"text-black/50"}`}>{t("signIn")}</button><button type="button" onClick={()=>setMode("signup")} className={`flex-1 py-3 ${mode==="signup"?"border-b-2 border-black font-semibold":"text-black/50"}`}>{t("signUp")}</button></div>{mode==="signup"&&<div><label className="block text-sm mb-2">{t("fullName")}</label><input required value={name} onChange={e=>setName(e.target.value)} className="w-full border border-black/10 rounded-xl px-4 py-3"/></div>}<div><label className="block text-sm mb-2">{t("email")}</label><input required type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="nama@email.com" className="w-full border border-black/10 rounded-xl px-4 py-3"/></div><div><label className="block text-sm mb-2">{t("password")}</label><input required minLength={8} type="password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full border border-black/10 rounded-xl px-4 py-3"/></div>{mode==="login"&&<label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={remember} onChange={e=>setRemember(e.target.checked)}/> {t("remember")}</label>}<Button type="submit" className="bg-[#1B2A4A] w-full h-12">{mode==="login"?t("signInButton"):t("createAccount")}</Button>{message&&<p className="text-sm text-black/60">{message}</p>}<p className="text-sm text-black/50 text-center">{mode==="login"?t("noAccount"):t("haveAccount")} <button type="button" onClick={()=>setMode(mode==="login"?"signup":"login")} className="underline text-black">{mode==="login"?t("signUp"):t("signIn")}</button></p><p className="pt-2 text-xs leading-5 text-black/40">Kata sandi diproses di server dan tidak disimpan di localStorage maupun cookie.</p></form>}</div></main>;
}
