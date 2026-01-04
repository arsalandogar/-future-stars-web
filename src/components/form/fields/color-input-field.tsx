import { ColorInput } from '@mantine/core';
import type { ColorInputProps } from '@mantine/core';

import { getFieldError, useFieldContext } from '@/lib/form-context';

type ColorInputFieldProps = Omit<ColorInputProps, 'value' | 'onChange'>;

export function ColorInputField(props: ColorInputFieldProps) {
  const field = useFieldContext<string>();

  return (
    <ColorInput
      value={field.state.value}
      onChange={(value) => field.handleChange(value)}
      error={getFieldError(field.state.meta.errors)}
      {...props}
    />
  );
}
