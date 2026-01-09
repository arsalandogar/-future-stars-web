import { Select } from '@mantine/core';
import type { SelectProps } from '@mantine/core';

import { getFieldError, useFieldContext } from '@/lib/form-context';

type NumberSelectFieldProps = Omit<SelectProps, 'value' | 'onChange'>;

/**
 * SelectField variant for number values.
 * Handles conversion between number (form) and string (Select component).
 */
export function NumberSelectField(props: NumberSelectFieldProps) {
  const field = useFieldContext<number | null>();

  return (
    <Select
      value={field.state.value != null ? String(field.state.value) : null}
      onChange={(value) => {
        if (value == null) {
          field.handleChange(null);
          return;
        }
        const numValue = Number(value);
        field.handleChange(Number.isNaN(numValue) ? null : numValue);
      }}
      error={getFieldError(field.state.meta.errors)}
      {...props}
    />
  );
}
