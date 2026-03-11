import { create } from 'zustand';

import type { Card, Pack } from '@/types';

export type ShareTarget =
  | { type: 'card'; card: Card }
  | { type: 'pack'; pack: Pack };

interface ShareModalState {
  opened: boolean;
  target: ShareTarget | null;
  openCard: (card: Card) => void;
  openPack: (pack: Pack) => void;
  close: () => void;
}

export const useShareModalStore = create<ShareModalState>((set) => ({
  opened: false,
  target: null,
  openCard: (card) => set({ opened: true, target: { type: 'card', card } }),
  openPack: (pack) => set({ opened: true, target: { type: 'pack', pack } }),
  close: () => set({ opened: false, target: null }),
}));
