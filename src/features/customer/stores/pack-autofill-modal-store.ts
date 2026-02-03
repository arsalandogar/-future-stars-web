import { create } from 'zustand';

import type { Pack } from '@/types';

interface PackAutofillModalState {
  isOpen: boolean;
  pack: Pack | null;
  needsAddToCart: boolean;

  // Actions
  open: (pack: Pack, options?: { needsAddToCart?: boolean }) => void;
  close: () => void;
}

export const usePackAutofillModalStore = create<PackAutofillModalState>(
  (set) => ({
    isOpen: false,
    pack: null,
    needsAddToCart: false,

    open: (pack, options) =>
      set({
        isOpen: true,
        pack,
        needsAddToCart: options?.needsAddToCart ?? false,
      }),

    close: () =>
      set({
        isOpen: false,
        pack: null,
        needsAddToCart: false,
      }),
  })
);
