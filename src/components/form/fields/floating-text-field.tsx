import type { TextInputProps } from '@mantine/core';

import { FloatingLabelInput } from '@/components/form/floating-label-input';
import { getFieldError, useFieldContext } from '@/lib/form-context';

type FloatingTextFieldProps = Omit<
  TextInputProps,
  'value' | 'onChange' | 'classNames'
>;

export function FloatingTextField(props: FloatingTextFieldProps) {
  const field = useFieldContext<string>();

  return (
    <FloatingLabelInput
      value={field.state.value}
      onChange={(e) => field.handleChange(e.target.value)}
      error={getFieldError(field.state.meta.errors)}
      {...props}
    />
  );
}
