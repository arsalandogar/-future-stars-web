import { create } from 'zustand';

interface PageHeaderState {
  title: string;
  description?: string;
  dynamicBreadcrumb?: string;
}

interface PageHeaderActions {
  setPageHeader: (state: Partial<PageHeaderState>) => void;
  resetPageHeader: () => void;
}

const initialState: PageHeaderState = {
  title: '',
  description: undefined,
  dynamicBreadcrumb: undefined,
};

export const usePageHeaderStore = create<PageHeaderState & PageHeaderActions>()(
  (set) => ({
    ...initialState,
    setPageHeader: (state) => set(state),
    resetPageHeader: () => set(initialState),
  })
);
