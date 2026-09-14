import Brands from "@/components/homepage/Brands";
import DressStyle from "@/components/homepage/DressStyle";
import Header from "@/components/homepage/Header";
import Reviews from "@/components/homepage/Reviews";
import { products } from "@/data/products";
import { Review } from "@/types/review.types";
import HomeCopy from "@/components/homepage/HomeCopy";

const newArrivalsData = products.slice(0, 8);
const topSellingData = [...products].sort((a,b) => b.rating - a.rating).slice(0,8);
const reviewsData: Review[] = products.flatMap((p) => p.reviews.slice(0,1)).slice(0,8);

export default function Home() {
  return (<><Header /><main className="my-[50px] sm:my-[72px]">
    <HomeCopy type="new" data={newArrivalsData}/>
    <div className="max-w-frame mx-auto px-4 xl:px-0"><hr className="h-[1px] border-t-black/10 my-10 sm:my-16" /></div>
    <div className="mb-[50px] sm:mb-20"><DressStyle /></div>
    <Brands />
    <div className="mt-[50px] sm:mt-20 mb-[50px] sm:mb-20"><HomeCopy type="top" data={topSellingData}/></div>
    <Reviews data={reviewsData} />
  </main></>);
}
