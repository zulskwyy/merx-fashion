export type PricingMode = "manual" | "profit" | "markup" | "margin";

export type PricingRule = {
  mode: PricingMode;
  target: number;
};

export type ProductDiscount = {
  amount?: number;
  percentage?: number;
  source?: "manual" | "auto";
};

export function normalizePricingRule(value: any): PricingRule {
  const mode: PricingMode = ["manual", "profit", "markup", "margin"].includes(value?.mode)
    ? value.mode
    : "manual";
  return { mode, target: Math.max(0, Number(value?.target ?? 0)) };
}

export function calculateBasePrice(cost: number, rule: PricingRule, manualPrice = 0) {
  const c = Math.max(0, Math.round(Number(cost) || 0));
  const target = Math.max(0, Number(rule.target) || 0);
  if (rule.mode === "profit") return Math.max(0, Math.round(c + target));
  if (rule.mode === "markup") return Math.max(0, Math.round(c * (1 + target / 100)));
  if (rule.mode === "margin") {
    if (target >= 100) return Math.max(c, 0);
    return Math.max(0, Math.round(c / (1 - target / 100)));
  }
  return Math.max(0, Math.round(Number(manualPrice) || 0));
}

export function discountedPrice(price: number, discount: ProductDiscount = {}) {
  const base = Math.max(0, Math.round(Number(price) || 0));
  const pct = Math.max(0, Math.min(100, Number(discount.percentage || 0)));
  const amount = Math.max(0, Number(discount.amount || 0));
  if (pct > 0) return Math.max(0, Math.round(base - (base * pct) / 100));
  if (amount > 0) return Math.max(0, base - Math.round(amount));
  return base;
}

export function pricingSummary(cost: number, basePrice: number, discount: ProductDiscount = {}) {
  const c = Math.max(0, Math.round(Number(cost) || 0));
  const base = Math.max(0, Math.round(Number(basePrice) || 0));
  const finalPrice = discountedPrice(base, discount);
  const profit = finalPrice - c;
  const margin = finalPrice > 0 ? (profit / finalPrice) * 100 : 0;
  return { finalPrice, profit, margin };
}
