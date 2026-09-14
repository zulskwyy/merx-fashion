import React from "react";
import { cn } from "@/lib/utils";
import { integralCF } from "@/styles/fonts";

const collectionsData: { id: string; label: string }[] = [
  { id: "signature", label: "SIGNATURE" },
  { id: "essentials", label: "ESSENTIALS" },
  { id: "heritage", label: "HERITAGE" },
  { id: "atelier", label: "ATELIER" },
  { id: "noir", label: "NOIR" },
];

const Brands = () => {
  return (
    <div className="bg-[#1B2A4A]">
      <div className="max-w-frame mx-auto flex flex-wrap items-center justify-center md:justify-between py-5 md:py-0 sm:px-4 xl:px-0 space-x-7">
        {collectionsData.map((collection) => (
          <span
            key={collection.id}
            className={cn([
              integralCF.className,
              "text-[#D4C4A8]/80 tracking-wide text-sm lg:text-lg my-5 md:my-11 select-none",
            ])}
          >
            {collection.label}
          </span>
        ))}
      </div>
    </div>
  );
};

export default Brands;
