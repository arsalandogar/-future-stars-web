import { create } from 'zustand';

export type CustomerAuthStep = 'phone-input' | 'signup' | 'otp-verify';
export type CustomerAuthFlow = 'login' | 'signup';

interface CustomerAuthState {
  step: CustomerAuthStep;
  flow: CustomerAuthFlow;
  phone: string;
  firstName: string;
  lastName: string;
  expiresIn: number | null;

  setPhone: (phone: string) => void;
  setFlow: (flow: CustomerAuthFlow) => void;
  setName: (firstName: string, lastName: string) => void;
  setExpiresIn: (expiresIn: number) => void;
  goToStep: (step: CustomerAuthStep) => void;
  reset: () => void;
}

export const useCustomerAuthStore = create<CustomerAuthState>((set) => ({
  step: 'phone-input',
  flow: 'login',
  phone: '',
  firstName: '',
  lastName: '',
  expiresIn: null,

  setPhone: (phone) => set({ phone }),
  setFlow: (flow) => set({ flow }),
  setName: (firstName, lastName) => set({ firstName, lastName }),
  setExpiresIn: (expiresIn) => set({ expiresIn }),
  goToStep: (step) => set({ step }),
  reset: () =>
    set({
      step: 'phone-input',
      flow: 'login',
      phone: '',
      firstName: '',
      lastName: '',
      expiresIn: null,
    }),
}));
