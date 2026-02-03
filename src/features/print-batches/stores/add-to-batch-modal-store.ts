import { create } from 'zustand';

type ModalMode = 'select' | 'create';

function generateDefaultBatchName(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const year = now.getFullYear();
  return `Batch-${month}${day}${year}`;
}

interface AddToBatchModalState {
  opened: boolean;
  orderIds: number[];
  ordersAlreadyInBatch: number[];
  mode: ModalMode;
  selectedBatchId: number | null;
  newBatchName: string;

  // Actions
  open: (orderIds: number[], ordersAlreadyInBatch?: number[]) => void;
  close: () => void;
  setMode: (mode: ModalMode) => void;
  setSelectedBatchId: (id: number | null) => void;
  setNewBatchName: (name: string) => void;
}

export const useAddToBatchModalStore = create<AddToBatchModalState>((set) => ({
  opened: false,
  orderIds: [],
  ordersAlreadyInBatch: [],
  mode: 'select',
  selectedBatchId: null,
  newBatchName: '',

  open: (orderIds, ordersAlreadyInBatch = []) =>
    set({
      opened: true,
      orderIds,
      ordersAlreadyInBatch,
      mode: 'select',
      selectedBatchId: null,
      newBatchName: generateDefaultBatchName(),
    }),

  close: () =>
    set({
      opened: false,
      orderIds: [],
      ordersAlreadyInBatch: [],
      selectedBatchId: null,
    }),

  setMode: (mode) => set({ mode }),
  setSelectedBatchId: (id) => set({ selectedBatchId: id }),
  setNewBatchName: (name) => set({ newBatchName: name }),
}));
