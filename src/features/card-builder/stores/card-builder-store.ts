import { create } from 'zustand';

import type { BuilderTab } from '../types';

interface CardBuilderState {
  selectedTemplateId: number | null;
  activeTab: BuilderTab;
  activeTagFilter: string | null;
  selectTemplate: (id: number) => void;
  setActiveTab: (tab: BuilderTab) => void;
  setActiveTagFilter: (tag: string | null) => void;
  reset: () => void;
}

const initialState = {
  selectedTemplateId: null,
  activeTab: 'templates' as BuilderTab,
  activeTagFilter: null,
};

export const useCardBuilderStore = create<CardBuilderState>()((set) => ({
  ...initialState,
  selectTemplate: (id) => set({ selectedTemplateId: id }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setActiveTagFilter: (tag) => set({ activeTagFilter: tag }),
  reset: () => set(initialState),
}));
