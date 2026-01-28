import { create } from 'zustand';

import type { Pack } from '@/types';

interface PackAutofillModalState {
  isOpen: boolean;
  pack: Pack | null;

  // Actions
  open: (pack: Pack) => void;
  close: () => void;
}

export const usePackAutofillModalStore = create<PackAutofillModalState>(
  (set) => ({
    isOpen: false,
    pack: null,

    open: (pack) =>
      set({
        isOpen: true,
        pack,
      }),

    close: () =>
      set({
        isOpen: false,
        pack: null,
      }),
  })
);
