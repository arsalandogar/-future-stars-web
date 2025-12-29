import { Button } from '@mantine/core';
import type { ButtonProps } from '@mantine/core';

import { useFormContext } from '@/lib/form-context';

type SubmitButtonProps = Omit<ButtonProps, 'type' | 'loading'> & {
  children: React.ReactNode;
};

export function SubmitButton({ children, ...props }: SubmitButtonProps) {
  const form = useFormContext();

  return (
    <form.Subscribe selector={(state) => state.isSubmitting}>
      {(isSubmitting) => (
        <Button type="submit" loading={isSubmitting} {...props}>
          {children}
        </Button>
      )}
    </form.Subscribe>
  );
}
