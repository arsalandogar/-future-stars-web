import { create } from 'zustand';

import type { EditableFieldId } from '@/features/templates';

import type { BuilderTab, ColorSubTab, PhotoSubTab } from '../types';

interface CardBuilderState {
  activeTab: BuilderTab | null;
  activeTagFilter: string | null;
  activeColorSubTab: ColorSubTab;
  activePhotoSubTab: PhotoSubTab;
  selectedImageFieldId: EditableFieldId | null;
  activeTemplateId: number | null;
  templateDefaultsId: number | null;
  setActiveTab: (tab: BuilderTab | null) => void;
  setActiveTagFilter: (tag: string | null) => void;
  setActiveColorSubTab: (tab: ColorSubTab) => void;
  setActivePhotoSubTab: (tab: PhotoSubTab) => void;
  setSelectedImageFieldId: (fieldId: EditableFieldId | null) => void;
  setActiveTemplateId: (id: number | null) => void;
  setTemplateDefaultsId: (id: number | null) => void;
  reset: () => void;
}

const initialState = {
  activeTab: null as BuilderTab | null,
  activeTagFilter: null,
  activeColorSubTab: 'popular' as ColorSubTab,
  activePhotoSubTab: 'image' as PhotoSubTab,
  selectedImageFieldId: null as EditableFieldId | null,
  activeTemplateId: null as number | null,
  templateDefaultsId: null as number | null,
};

export const useCardBuilderStore = create<CardBuilderState>()((set) => ({
  ...initialState,
  setActiveTab: (tab) => set({ activeTab: tab }),
  setActiveTagFilter: (tag) => set({ activeTagFilter: tag }),
  setActiveColorSubTab: (tab) => set({ activeColorSubTab: tab }),
  setActivePhotoSubTab: (tab) => set({ activePhotoSubTab: tab }),
  setSelectedImageFieldId: (fieldId) => set({ selectedImageFieldId: fieldId }),
  setActiveTemplateId: (id) => set({ activeTemplateId: id }),
  setTemplateDefaultsId: (id) => set({ templateDefaultsId: id }),
  reset: () => set(initialState),
}));
