export type Discount = {
  amount: number;
  percentage: number;
};

export type TaxRule = {
  mode: "auto" | "manual";
  rate?: number | null;
};

export type FAQ = {
  question: string;
  answer: string;
};

export type Product = {
  id: number;
  title: string;
  slug: string;
  srcUrl: string;
  gallery: string[];
  price: number;
  discount: Discount;
  tax?: TaxRule;
  rating: number;
  reviewCount: number;
  category: string;
  gender: string;
  color: string;
  sizes: string[];
  description: string;
  details: Record<string, string>;
  faqs: FAQ[];
  reviews: ReviewData[];
  sourcePage: string;
  sourceId: string;
  sourceDescription: string;
};

export type ReviewData = {
  id: number;
  user: string;
  content: string;
  rating: number;
  date: string;
  verified?: boolean;
};
