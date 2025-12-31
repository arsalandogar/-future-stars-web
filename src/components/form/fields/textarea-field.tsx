import { Textarea } from '@mantine/core';
import type { TextareaProps } from '@mantine/core';

import { useFieldContext } from '@/lib/form-context';

type TextareaFieldProps = Omit<TextareaProps, 'value' | 'onChange'>;

export function TextareaField(props: TextareaFieldProps) {
  const field = useFieldContext<string>();

  return (
    <Textarea
      value={field.state.value}
      onChange={(e) => field.handleChange(e.target.value)}
      error={
        (field.state.meta.errors[0] as { message: string } | undefined)?.message
      }
      {...props}
    />
  );
}
