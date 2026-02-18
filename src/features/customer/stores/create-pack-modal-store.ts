import { create } from 'zustand';

import type { Pack } from '@/types';

import { convertPackCardsToMap } from '../utils/convert-pack-cards-to-map';

type ModalMode = 'create' | 'edit' | 'copy' | 'buy';

interface CreatePackModalState {
  opened: boolean;
  mode: ModalMode;
  editingPack?: Pack;
  initialSelectedCards?: Map<number, number>;

  // Actions
  openCreate: () => void;
  openEdit: (pack: Pack) => void;
  openCopy: (pack: Pack) => void;
  openBuy: (cardId: number, quantity: number) => void;
  close: () => void;
}

export const useCreatePackModalStore = create<CreatePackModalState>((set) => ({
  opened: false,
  mode: 'create',
  editingPack: undefined,
  initialSelectedCards: undefined,

  openCreate: () =>
    set({
      opened: true,
      mode: 'create',
      editingPack: undefined,
      initialSelectedCards: undefined,
    }),

  openEdit: (pack) =>
    set({
      opened: true,
      mode: 'edit',
      editingPack: pack,
      initialSelectedCards: undefined,
    }),

  openCopy: (pack) =>
    set({
      opened: true,
      mode: 'copy',
      editingPack: undefined,
      initialSelectedCards: convertPackCardsToMap(pack.packCards),
    }),

  openBuy: (cardId, quantity) =>
    set({
      opened: true,
      mode: 'buy',
      editingPack: undefined,
      initialSelectedCards: new Map([[cardId, quantity]]),
    }),

  close: () =>
    set({
      opened: false,
      editingPack: undefined,
      initialSelectedCards: undefined,
    }),
}));
