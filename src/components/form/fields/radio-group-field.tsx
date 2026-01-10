import { Radio, Stack } from '@mantine/core';
import type { RadioGroupProps } from '@mantine/core';

import { getFieldError, useFieldContext } from '@/lib/form-context';

type RadioGroupFieldProps = Omit<RadioGroupProps, 'value' | 'onChange'>;

export function RadioGroupField({ children, ...props }: RadioGroupFieldProps) {
  const field = useFieldContext<string>();

  return (
    <Radio.Group
      value={field.state.value}
      onChange={field.handleChange}
      error={getFieldError(field.state.meta.errors)}
      {...props}
    >
      <Stack gap="md">{children}</Stack>
    </Radio.Group>
  );
}
