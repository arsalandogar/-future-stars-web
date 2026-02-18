import { create } from 'zustand';

import type { BuilderTab } from '../types';

interface CardBuilderState {
  activeTab: BuilderTab;
  activeTagFilter: string | null;
  setActiveTab: (tab: BuilderTab) => void;
  setActiveTagFilter: (tag: string | null) => void;
  reset: () => void;
}

const initialState = {
  activeTab: 'templates' as BuilderTab,
  activeTagFilter: null,
};

export const useCardBuilderStore = create<CardBuilderState>()((set) => ({
  ...initialState,
  setActiveTab: (tab) => set({ activeTab: tab }),
  setActiveTagFilter: (tag) => set({ activeTagFilter: tag }),
  reset: () => set(initialState),
}));
