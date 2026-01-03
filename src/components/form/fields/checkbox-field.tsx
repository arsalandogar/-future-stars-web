import { Checkbox } from '@mantine/core';
import type { CheckboxProps } from '@mantine/core';

import { useFieldContext } from '@/lib/form-context';

type CheckboxFieldProps = Omit<CheckboxProps, 'checked' | 'onChange'>;

export function CheckboxField(props: CheckboxFieldProps) {
  const field = useFieldContext<boolean>();

  return (
    <Checkbox
      checked={field.state.value}
      onChange={(e) => field.handleChange(e.target.checked)}
      error={
        (field.state.meta.errors[0] as { message: string } | undefined)?.message
      }
      {...props}
    />
  );
}
