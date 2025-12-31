import { Select } from '@mantine/core';
import type { SelectProps } from '@mantine/core';

import { useFieldContext } from '@/lib/form-context';

type SelectFieldProps = Omit<SelectProps, 'value' | 'onChange'>;

export function SelectField(props: SelectFieldProps) {
  const field = useFieldContext<string | null>();

  return (
    <Select
      value={field.state.value}
      onChange={(value) => field.handleChange(value)}
      error={
        (field.state.meta.errors[0] as { message: string } | undefined)?.message
      }
      {...props}
    />
  );
}
