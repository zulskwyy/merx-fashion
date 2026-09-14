import ProductListSec from "@/components/common/ProductListSec";
import Brands from "@/components/homepage/Brands";
import DressStyle from "@/components/homepage/DressStyle";
import Header from "@/components/homepage/Header";
import Reviews from "@/components/homepage/Reviews";
import { products } from "@/data/products";
import { Review } from "@/types/review.types";

const newArrivalsData = products.slice(0, 8);
const topSellingData = [...products].sort((a,b) => b.rating - a.rating).slice(0,8);
const reviewsData: Review[] = products.flatMap((p) => p.reviews.slice(0,1)).slice(0,8);

export default function Home() {
  return (<><Header /><main className="my-[50px] sm:my-[72px]">
    <ProductListSec title="NEW ARRIVALS" data={newArrivalsData} viewAllLink="/shop?sort=new" />
    <div className="max-w-frame mx-auto px-4 xl:px-0"><hr className="h-[1px] border-t-black/10 my-10 sm:my-16" /></div>
    <div className="mb-[50px] sm:mb-20"><DressStyle /></div>
    <Brands />
    <div className="mt-[50px] sm:mt-20 mb-[50px] sm:mb-20"><ProductListSec title="TOP SELLING" data={topSellingData} viewAllLink="/shop?sort=popular" /></div>
    <Reviews data={reviewsData} />
  </main></>);
}
