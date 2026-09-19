import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Discount, TaxRule } from "@/types/product.types";
import { discountedPrice, getCartSubtotal, getCartTotal } from "@/lib/catalog";

export type RemoveCartItem = { id: number; attributes: string[] };
export type CartItem = { id: number; name: string; srcUrl: string; price: number; attributes: string[]; discount: Discount; tax?: TaxRule; quantity: number };
export type Cart = { items: CartItem[]; totalQuantities: number };
interface CartsState { cart: Cart | null; totalPrice: number; adjustedTotalPrice: number; action: "update" | "add" | "delete" | null; }
const initialState: CartsState = { cart: null, totalPrice: 0, adjustedTotalPrice: 0, action: null };

const sameItem = (a: CartItem, b: {id:number; attributes:string[]}) => a.id === b.id && a.attributes.join("|") === b.attributes.join("|");
const syncTotals = (state: CartsState) => {
  const items = state.cart?.items ?? [];
  state.totalPrice = getCartSubtotal(items);
  state.adjustedTotalPrice = getCartTotal(items);
  if (state.cart) state.cart.totalQuantities = items.reduce((sum, item) => sum + item.quantity, 0);
};

export const cartsSlice = createSlice({
  name: "carts", initialState, reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      if (!state.cart) state.cart = { items: [], totalQuantities: 0 };
      const index = state.cart.items.findIndex((item) => sameItem(item, action.payload));
      if (index >= 0) state.cart.items[index].quantity += action.payload.quantity;
      else state.cart.items.push({ ...action.payload });
      state.action = "add"; syncTotals(state);
    },
    removeCartItem: (state, action: PayloadAction<RemoveCartItem>) => {
      if (!state.cart) return;
      const item = state.cart.items.find((entry) => sameItem(entry, action.payload));
      if (!item) return;
      item.quantity -= 1;
      if (item.quantity <= 0) state.cart.items = state.cart.items.filter((entry) => entry !== item);
      state.action = "update"; syncTotals(state);
    },
    remove: (state, action: PayloadAction<RemoveCartItem & { quantity?: number }>) => {
      if (!state.cart) return;
      state.cart.items = state.cart.items.filter((entry) => !sameItem(entry, action.payload));
      state.action = "delete"; syncTotals(state);
      if (!state.cart.items.length) state.cart = null;
    },
    clearCart: (state) => { state.cart = null; state.action = "delete"; syncTotals(state); },
  },
});
export const { addToCart, removeCartItem, remove, clearCart } = cartsSlice.actions;
export default cartsSlice.reducer;
