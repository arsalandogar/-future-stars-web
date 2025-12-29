import type { PasswordInputProps } from '@mantine/core';

import { FloatingPasswordInput } from '@/components/form/floating-label-input';
import { useFieldContext } from '@/lib/form-context';

type FloatingPasswordFieldProps = Omit<
  PasswordInputProps,
  'value' | 'onChange' | 'classNames'
>;

export function FloatingPasswordField(props: FloatingPasswordFieldProps) {
  const field = useFieldContext<string>();

  return (
    <FloatingPasswordInput
      value={field.state.value}
      onChange={(e) => field.handleChange(e.target.value)}
      error={
        (field.state.meta.errors[0] as { message: string } | undefined)?.message
      }
      {...props}
    />
  );
}
