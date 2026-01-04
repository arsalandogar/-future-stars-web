import { getFieldError, useFieldContext } from '@/lib/form-context';
import { NumberInput } from '@mantine/core';
import type { NumberInputProps } from '@mantine/core';

type NumberInputFieldProps = Omit<NumberInputProps, 'value' | 'onChange'>;

export function NumberInputField(props: NumberInputFieldProps) {
  const field = useFieldContext<number>();

  return (
    <NumberInput
      value={field.state.value}
      onChange={(value) => {
        const numValue =
          typeof value === 'string' ? parseFloat(value) || 0 : (value ?? 0);
        field.handleChange(numValue);
      }}
      error={getFieldError(field.state.meta.errors)}
      {...props}
    />
  );
}
