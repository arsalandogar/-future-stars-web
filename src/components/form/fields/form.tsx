import type { ReactNode } from 'react';
import { useBlocker } from '@tanstack/react-router';

import { useFormContext } from '@/lib/form-context';

type FormProps = {
  children: ReactNode;
  blockOnUnsavedChanges?: boolean;
};

export function Form({ children, blockOnUnsavedChanges = false }: FormProps) {
  const form = useFormContext();

  useBlocker({
    disabled: !blockOnUnsavedChanges,
    shouldBlockFn: () => {
      const { isDirty, isSubmitting } = form.state;
      if (!isDirty || isSubmitting) {
        return false;
      }
      const shouldLeave = window.confirm(
        'You have unsaved changes. Are you sure you want to leave?'
      );
      return !shouldLeave;
    },
  });

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
