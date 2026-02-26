import { create } from 'zustand';

import type { BuilderTab, ColorSubTab } from '../types';

interface CardBuilderState {
  activeTab: BuilderTab;
  activeTagFilter: string | null;
  activeColorSubTab: ColorSubTab;
  setActiveTab: (tab: BuilderTab) => void;
  setActiveTagFilter: (tag: string | null) => void;
  setActiveColorSubTab: (tab: ColorSubTab) => void;
  reset: () => void;
}

const initialState = {
  activeTab: 'templates' as BuilderTab,
  activeTagFilter: null,
  activeColorSubTab: 'popular' as ColorSubTab,
};

export const useCardBuilderStore = create<CardBuilderState>()((set) => ({
  ...initialState,
  setActiveTab: (tab) => set({ activeTab: tab }),
  setActiveTagFilter: (tag) => set({ activeTagFilter: tag }),
  setActiveColorSubTab: (tab) => set({ activeColorSubTab: tab }),
  reset: () => set(initialState),
}));
