import { MultiSelect } from '@mantine/core';
import type { MultiSelectProps } from '@mantine/core';

import { getFieldError, useFieldContext } from '@/lib/form-context';

type NumberMultiSelectFieldProps = Omit<MultiSelectProps, 'value' | 'onChange'>;

/**
 * MultiSelectField variant for number array values.
 * Handles conversion between number[] (form) and string[] (MultiSelect component).
 */
export function NumberMultiSelectField(props: NumberMultiSelectFieldProps) {
  const field = useFieldContext<number[]>();

  return (
    <MultiSelect
      value={(field.state.value ?? []).map(String)}
      onChange={(values) => {
        field.handleChange(values.map(Number));
      }}
      error={getFieldError(field.state.meta.errors)}
      {...props}
    />
  );
}
