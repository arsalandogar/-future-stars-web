import { create } from 'zustand';

interface HeaderState {
  mobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
}

export const useHeaderStore = create<HeaderState>()((set) => ({
  mobileMenuOpen: false,
  toggleMobileMenu: () =>
    set((state) => ({ mobileMenuOpen: !state.mobileMenuOpen })),
}));
