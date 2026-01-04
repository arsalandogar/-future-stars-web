import { PasswordInput } from '@mantine/core';
import type { PasswordInputProps } from '@mantine/core';

import { getFieldError, useFieldContext } from '@/lib/form-context';

type PasswordFieldProps = Omit<PasswordInputProps, 'value' | 'onChange'>;

export function PasswordField(props: PasswordFieldProps) {
  const field = useFieldContext<string>();

  return (
    <PasswordInput
      value={field.state.value}
      onChange={(e) => field.handleChange(e.target.value)}
      error={getFieldError(field.state.meta.errors)}
      {...props}
    />
  );
}
