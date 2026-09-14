import React from "react";
import Link from "next/link";
import Rating from "@/components/ui/Rating";
import { Product } from "@/types/product.types";
import { discountedPrice, formatIDR } from "@/lib/catalog";

const ProductCard = ({ data }: { data: Product }) => {
  const sale = discountedPrice(data);
  return (
    <Link href={`/shop/product/${data.id}/${data.slug}`} className="group flex flex-col items-start">
      <div className="bg-[#F3EFE7] rounded-[13px] lg:rounded-[20px] w-full aspect-square mb-2.5 xl:mb-4 overflow-hidden">
        <img src={data.srcUrl} width={640} height={640} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500" alt={data.title} />
      </div>
      <div className="flex items-center gap-2 mb-1 text-xs text-black/50"><span>{data.category}</span><span>·</span><span>{data.color}</span></div>
      <strong className="text-black xl:text-xl line-clamp-2 min-h-[3.25rem]">{data.title}</strong>
      <div className="flex items-end mb-1 xl:mb-2">
        <Rating initialValue={data.rating} allowFraction SVGclassName="inline-block" emptyClassName="fill-gray-50" size={18} readonly />
        <span className="text-black text-xs xl:text-sm ml-2">{data.rating.toFixed(1)}<span className="text-black/60">/5</span></span>
        <span className="text-black/40 text-xs ml-2">({data.reviewCount})</span>
      </div>
      <div className="flex items-center flex-wrap gap-2">
        <span className="font-bold text-black text-xl xl:text-2xl">{formatIDR(sale)}</span>
        {sale < data.price && <><span className="font-bold text-black/40 line-through text-sm xl:text-base">{formatIDR(data.price)}</span><span className="font-medium text-[10px] py-1 px-2 rounded-full bg-[#7A1F2B]/10 text-[#7A1F2B]">-{data.discount.percentage}%</span></>}
      </div>
    </Link>
  );
};
export default ProductCard;
