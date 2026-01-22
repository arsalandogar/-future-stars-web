import { create } from 'zustand';

import type { CartItem } from '@/types';

interface AddedToCartPopupState {
  isOpen: boolean;
  cartItem: CartItem | null;
}

interface AddedToCartPopupActions {
  open: (cartItem: CartItem) => void;
  close: () => void;
}

const initialState: AddedToCartPopupState = {
  isOpen: false,
  cartItem: null,
};

export const useAddedToCartPopupStore = create<
  AddedToCartPopupState & AddedToCartPopupActions
>((set) => ({
  ...initialState,

  open: (cartItem) =>
    set({
      isOpen: true,
      cartItem,
    }),

  close: () =>
    set({
      isOpen: false,
      cartItem: null,
    }),
}));
