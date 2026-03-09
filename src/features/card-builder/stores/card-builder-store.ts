import { create } from 'zustand';

import type { EditableFieldId } from '@/features/templates';

import type { BuilderTab, ColorSubTab, PhotoSubTab } from '../types';

interface CardBuilderState {
  activeTab: BuilderTab | null;
  activeTagFilter: string | null;
  activeColorSubTab: ColorSubTab;
  activePhotoSubTab: PhotoSubTab;
  selectedImageFieldId: EditableFieldId | null;
  setActiveTab: (tab: BuilderTab | null) => void;
  setActiveTagFilter: (tag: string | null) => void;
  setActiveColorSubTab: (tab: ColorSubTab) => void;
  setActivePhotoSubTab: (tab: PhotoSubTab) => void;
  setSelectedImageFieldId: (fieldId: EditableFieldId | null) => void;
  reset: () => void;
}

const initialState = {
  activeTab: null as BuilderTab | null,
  activeTagFilter: null,
  activeColorSubTab: 'popular' as ColorSubTab,
  activePhotoSubTab: 'image' as PhotoSubTab,
  selectedImageFieldId: null as EditableFieldId | null,
};

export const useCardBuilderStore = create<CardBuilderState>()((set) => ({
  ...initialState,
  setActiveTab: (tab) => set({ activeTab: tab }),
  setActiveTagFilter: (tag) => set({ activeTagFilter: tag }),
  setActiveColorSubTab: (tab) => set({ activeColorSubTab: tab }),
  setActivePhotoSubTab: (tab) => set({ activePhotoSubTab: tab }),
  setSelectedImageFieldId: (fieldId) => set({ selectedImageFieldId: fieldId }),
  reset: () => set(initialState),
}));
