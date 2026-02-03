import { create } from 'zustand';

interface BatchSelectionState {
  selectedBatchIds: Set<number>;

  // Actions
  toggleBatch: (batchId: number) => void;
  selectBatches: (batchIds: number[]) => void;
  deselectBatches: (batchIds: number[]) => void;
  selectAll: (batchIds: number[]) => void;
  clearSelection: () => void;
  isSelected: (batchId: number) => boolean;
}

export const useBatchSelectionStore = create<BatchSelectionState>(
  (set, get) => ({
    selectedBatchIds: new Set(),

    toggleBatch: (batchId) =>
      set((state) => {
        const newSet = new Set(state.selectedBatchIds);
        if (newSet.has(batchId)) {
          newSet.delete(batchId);
        } else {
          newSet.add(batchId);
        }
        return { selectedBatchIds: newSet };
      }),

    selectBatches: (batchIds) =>
      set((state) => {
        const newSet = new Set(state.selectedBatchIds);
        batchIds.forEach((id) => newSet.add(id));
        return { selectedBatchIds: newSet };
      }),

    deselectBatches: (batchIds) =>
      set((state) => {
        const newSet = new Set(state.selectedBatchIds);
        batchIds.forEach((id) => newSet.delete(id));
        return { selectedBatchIds: newSet };
      }),

    selectAll: (batchIds) => set({ selectedBatchIds: new Set(batchIds) }),

    clearSelection: () => set({ selectedBatchIds: new Set() }),

    isSelected: (batchId) => get().selectedBatchIds.has(batchId),
  })
);
