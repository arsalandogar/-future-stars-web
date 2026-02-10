import { Text, TextInput } from '@mantine/core';
import type { TextInputProps } from '@mantine/core';

import { getFieldError, useFieldContext } from '@/lib/form-context';
import { formatPhone } from '@/utils/format-phone';

const MAX_DIGITS = 10;

type PhoneFieldProps = Omit<
  TextInputProps,
  'value' | 'onChange' | 'type' | 'leftSection' | 'leftSectionWidth'
>;

export function PhoneField(props: PhoneFieldProps) {
  const field = useFieldContext<string>();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, MAX_DIGITS);
    field.handleChange(digits);
  };

  return (
    <TextInput
      type="tel"
      value={formatPhone(field.state.value)}
      onChange={handleChange}
      error={getFieldError(field.state.meta.errors)}
      leftSection={
        <Text size="sm" fw={500}>
          🇺🇸 +1
        </Text>
      }
      leftSectionWidth={64}
      placeholder="(555) 123-4567"
      {...props}
    />
  );
}
