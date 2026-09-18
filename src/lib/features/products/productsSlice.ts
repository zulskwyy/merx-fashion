import { createSlice, PayloadAction } from "@reduxjs/toolkit";
export type Color = { name: string; code?: string };
interface ProductsState { colorSelection: Color; sizeSelection: string; }
const initialState: ProductsState = { colorSelection: { name: "White" }, sizeSelection: "M" };
const productsSlice = createSlice({name:"products",initialState,reducers:{setColorSelection:(s,a:PayloadAction<Color>)=>{s.colorSelection=a.payload},setSizeSelection:(s,a:PayloadAction<string>)=>{s.sizeSelection=a.payload}}});
export const {setColorSelection,setSizeSelection}=productsSlice.actions;export default productsSlice.reducer;
