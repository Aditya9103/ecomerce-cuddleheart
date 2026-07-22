import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  guestCartItems: localStorage.getItem('guestCart') ? JSON.parse(localStorage.getItem('guestCart')) : [],
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToGuestCart: (state, action) => {
      const item = action.payload; // { product: { _id, ... }, quantity }
      const existItem = state.guestCartItems.find((x) => x.product._id === item.product._id);
      
      if (existItem) {
        state.guestCartItems = state.guestCartItems.map((x) =>
          x.product._id === existItem.product._id ? { ...x, quantity: x.quantity + item.quantity } : x
        );
      } else {
        state.guestCartItems = [...state.guestCartItems, item];
      }
      localStorage.setItem('guestCart', JSON.stringify(state.guestCartItems));
    },
    updateGuestCartQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      state.guestCartItems = state.guestCartItems.map((x) => 
        x.product._id === id ? { ...x, quantity } : x
      );
      localStorage.setItem('guestCart', JSON.stringify(state.guestCartItems));
    },
    removeFromGuestCart: (state, action) => {
      state.guestCartItems = state.guestCartItems.filter((x) => x.product._id !== action.payload);
      localStorage.setItem('guestCart', JSON.stringify(state.guestCartItems));
    },
    clearGuestCart: (state) => {
      state.guestCartItems = [];
      localStorage.removeItem('guestCart');
    },
  },
});

export const { addToGuestCart, updateGuestCartQuantity, removeFromGuestCart, clearGuestCart } = cartSlice.actions;
export default cartSlice.reducer;
