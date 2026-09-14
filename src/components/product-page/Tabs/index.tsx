"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import ProductDetailsContent from "./ProductDetailsContent";
import ReviewsContent from "./ReviewsContent";
import FaqContent from "./FaqContent";
import type { Product } from "@/types/product.types";

type Tab = { id: 1 | 2 | 3; label: string };

export default function Tabs({ product }: { product: Product }) {
  const [active, setActive] = useState<1 | 2 | 3>(1);
  const { t } = useI18n();
  const tabs: Tab[] = [
    { id: 1, label: t("productDetails") },
    { id: 2, label: t("reviews") },
    { id: 3, label: t("faqs") },
  ];

  return (
    <div>
      <div className="flex items-center mb-6 sm:mb-8 overflow-x-auto">
        {tabs.map((tab) => (
          <Button key={tab.id} variant="ghost" type="button" className={cn(active === tab.id ? "border-black border-b-2 font-medium" : "border-b border-black/10 text-black/60 font-normal", "p-5 sm:p-6 rounded-none flex-1 min-w-[150px]")} onClick={() => setActive(tab.id)}>
            {tab.label}
          </Button>
        ))}
      </div>
      <div className="mb-12 sm:mb-16">
        {active === 1 && <ProductDetailsContent product={product} />}
        {active === 2 && <ReviewsContent product={product} />}
        {active === 3 && <FaqContent product={product} />}
      </div>
    </div>
  );
}
