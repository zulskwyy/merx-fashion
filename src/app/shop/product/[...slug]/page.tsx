import ProductListSec from "@/components/common/ProductListSec";
import BreadcrumbProduct from "@/components/product-page/BreadcrumbProduct";
import Header from "@/components/product-page/Header";
import Tabs from "@/components/product-page/Tabs";
import {products} from "@/data/products";
import {notFound} from "next/navigation";
export function generateStaticParams(){return products.map(p=>({slug:[String(p.id),p.slug]}));}
export default function ProductPage({params}:{params:{slug:string[]}}){const product=products.find(p=>p.id===Number(params.slug[0])); if(!product) notFound(); const related=products.filter(p=>p.id!==product.id&&p.category===product.category).slice(0,8); return <main><div className="max-w-frame mx-auto px-4 xl:px-0"><hr className="h-[1px] border-t-black/10 mb-5 sm:mb-6"/><BreadcrumbProduct title={product.title}/><section className="mb-11"><Header data={product}/></section><Tabs product={product}/></div><div className="mb-[50px] sm:mb-20"><ProductListSec title="You might also like" data={related}/></div></main>}
