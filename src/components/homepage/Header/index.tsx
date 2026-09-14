import AnimatedCounter from "@/components/ui/AnimatedCounter";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { integralCF } from "@/styles/fonts";
import Link from "next/link";
import React from "react";
import * as motion from "framer-motion/client";

const Header = () => {
  return (
    <header className="bg-[#F3EFE7] pt-10 md:pt-24 overflow-hidden">
      <div className="md:max-w-frame mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
        <motion.section
          initial={{ y: "100px", opacity: 0 }}
          whileInView={{ y: "0", opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="order-2 md:order-1 relative md:px-4 min-h-[448px] md:min-h-[428px] bg-cover bg-top xl:bg-[center_top_-1.6rem] bg-no-repeat bg-[url('/images/header-res-homepage.png')] md:bg-[url('/images/header-homepage.png')]"
        >
          <div className="absolute left-4 top-6 md:left-8 md:top-8 bg-[#1B2A4A] text-[#D4C4A8] text-[11px] tracking-[0.2em] px-4 py-2 border border-[#D4C4A8]/40">
            NEW COLLECTION — 2026
          </div>
        </motion.section>
        <section className="order-1 md:order-2 max-w-frame px-4">
          <motion.h2
            initial={{ y: "100px", opacity: 0, rotate: 10 }}
            whileInView={{ y: "0", opacity: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className={cn([
              integralCF.className,
              "text-4xl lg:text-[64px] lg:leading-[64px] mb-5 lg:mb-8",
            ])}
          >
            TIMELESS PIECES, MADE TO LAST
          </motion.h2>
          <motion.p
            initial={{ y: "100px", opacity: 0 }}
            whileInView={{ y: "0", opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-black/60 text-sm lg:text-base mb-6 lg:mb-8 max-w-[545px]"
          >
            Curated fashion for those who value quality over trend — every
            piece considered, every detail intentional.
          </motion.p>
          <motion.div
            initial={{ y: "100px", opacity: 0 }}
            whileInView={{ y: "0", opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 1, duration: 0.6 }}
          >
            <Link
              href="/shop"
              className="w-full md:w-52 mb-10 md:mb-12 inline-block text-center bg-[#1B2A4A] hover:bg-[#1B2A4A]/85 transition-all text-white px-14 py-4"
            >
              Shop Now
            </Link>
          </motion.div>
        </section>
      </div>
      <motion.div
        initial={{ y: "40px", opacity: 0 }}
        whileInView={{ y: "0", opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="border-t border-black/10 mt-10 md:mt-16"
      >
        <div className="max-w-frame mx-auto flex items-center justify-center md:justify-between flex-wrap sm:flex-nowrap py-8 px-4 md:px-0 space-x-3 sm:space-x-8"
        >
          <div className="flex flex-col items-center md:items-start">
            <span className="font-bold text-2xl md:text-xl lg:text-3xl xl:text-[40px] xl:mb-2">
              <AnimatedCounter from={0} to={200} />+
            </span>
            <span className="text-xs xl:text-base text-black/60 text-nowrap">
              International Brands
            </span>
          </div>
          <Separator
            className="h-12 md:h-16 bg-black/10"
            orientation="vertical"
          />
          <div className="flex flex-col items-center md:items-start">
            <span className="font-bold text-2xl md:text-xl lg:text-3xl xl:text-[40px] xl:mb-2">
              <AnimatedCounter from={0} to={2000} />+
            </span>
            <span className="text-xs xl:text-base text-black/60 text-nowrap">
              High-Quality Products
            </span>
          </div>
          <Separator
            className="hidden sm:block h-12 md:h-16 bg-black/10"
            orientation="vertical"
          />
          <div className="flex flex-col items-center md:items-start">
            <span className="font-bold text-2xl md:text-xl lg:text-3xl xl:text-[40px] xl:mb-2">
              <AnimatedCounter from={0} to={3000} />+
            </span>
            <span className="text-xs xl:text-base text-black/60 text-nowrap">
              Happy Customers
            </span>
          </div>
        </div>
      </motion.div>
    </header>
  );
};

export default Header;
