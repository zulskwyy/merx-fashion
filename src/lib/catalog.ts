import { Product } from "@/types/product.types";

export const discountedPrice = (product: Pick<Product, "price" | "discount">) =>
  product.discount.percentage > 0
    ? Math.round(product.price - (product.price * product.discount.percentage) / 100)
    : product.discount.amount > 0
      ? Math.max(0, product.price - product.discount.amount)
      : product.price;

export const formatIDR = (value: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);

export const getCartTotal = (items: Array<{ price: number; discount: Product["discount"]; quantity: number }>) =>
  items.reduce((sum, item) => sum + discountedPrice(item) * item.quantity, 0);

export const getCartSubtotal = (items: Array<{ price: number; quantity: number }>) =>
  items.reduce((sum, item) => sum + item.price * item.quantity, 0);
