import { MultiSelect } from '@mantine/core';
import type { MultiSelectProps } from '@mantine/core';

import { getFieldError, useFieldContext } from '@/lib/form-context';

type MultiSelectFieldProps = Omit<MultiSelectProps, 'value' | 'onChange'>;

export function MultiSelectField(props: MultiSelectFieldProps) {
  const field = useFieldContext<string[]>();

  return (
    <MultiSelect
      value={field.state.value}
      onChange={field.handleChange}
      error={getFieldError(field.state.meta.errors)}
      {...props}
    />
  );
}
