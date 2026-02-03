import { create } from 'zustand';

interface OrderSelectionState {
  selectedOrderIds: Set<number>;

  // Actions
  toggleOrder: (orderId: number) => void;
  selectOrders: (orderIds: number[]) => void;
  deselectOrders: (orderIds: number[]) => void;
  selectAll: (orderIds: number[]) => void;
  clearSelection: () => void;
  isSelected: (orderId: number) => boolean;
}

export const useOrderSelectionStore = create<OrderSelectionState>(
  (set, get) => ({
    selectedOrderIds: new Set(),

    toggleOrder: (orderId) =>
      set((state) => {
        const newSet = new Set(state.selectedOrderIds);
        if (newSet.has(orderId)) {
          newSet.delete(orderId);
        } else {
          newSet.add(orderId);
        }
        return { selectedOrderIds: newSet };
      }),

    selectOrders: (orderIds) =>
      set((state) => {
        const newSet = new Set(state.selectedOrderIds);
        orderIds.forEach((id) => newSet.add(id));
        return { selectedOrderIds: newSet };
      }),

    deselectOrders: (orderIds) =>
      set((state) => {
        const newSet = new Set(state.selectedOrderIds);
        orderIds.forEach((id) => newSet.delete(id));
        return { selectedOrderIds: newSet };
      }),

    selectAll: (orderIds) => set({ selectedOrderIds: new Set(orderIds) }),

    clearSelection: () => set({ selectedOrderIds: new Set() }),

    isSelected: (orderId) => get().selectedOrderIds.has(orderId),
  })
);
