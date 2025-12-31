import type { ReactNode } from 'react';

import { useFormContext } from '@/lib/form-context';

type FormProps = {
  children: ReactNode;
};

export function Form({ children }: FormProps) {
  const form = useFormContext();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void form.handleSubmit();
      }}
    >
      {children}
    </form>
  );
}
