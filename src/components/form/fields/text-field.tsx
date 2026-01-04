import { TextInput } from '@mantine/core';
import type { TextInputProps } from '@mantine/core';

import { getFieldError, useFieldContext } from '@/lib/form-context';

type TextFieldProps = Omit<TextInputProps, 'value' | 'onChange'>;

export function TextField(props: TextFieldProps) {
  const field = useFieldContext<string>();

  return (
    <TextInput
      value={field.state.value}
      onChange={(e) => field.handleChange(e.target.value)}
      error={getFieldError(field.state.meta.errors)}
      {...props}
    />
  );
}
