import { MultiSelect, Select } from '@mantine/core';
import type { MultiSelectProps, SelectProps } from '@mantine/core';

import { getFieldError, useFieldContext } from '@/lib/form-context';

type SingleSelectFieldProps = {
  multi?: false;
  valueAs?: 'string' | 'number';
} & Omit<SelectProps, 'value' | 'onChange'>;

type MultiSelectFieldProps = {
  multi: true;
  valueAs?: 'string' | 'number';
} & Omit<MultiSelectProps, 'value' | 'onChange'>;

type SelectFieldProps = SingleSelectFieldProps | MultiSelectFieldProps;

export function SelectField(props: SelectFieldProps): React.ReactNode {
  const { multi = false, valueAs = 'string', ...restProps } = props;

  if (multi) {
    return (
      <MultiSelectInternal
        valueAs={valueAs}
        {...(restProps as Omit<MultiSelectProps, 'value' | 'onChange'>)}
      />
    );
  }

  return (
    <SingleSelectInternal
      valueAs={valueAs}
      {...(restProps as Omit<SelectProps, 'value' | 'onChange'>)}
    />
  );
}

type SingleSelectInternalProps = {
  valueAs: 'string' | 'number';
} & Omit<SelectProps, 'value' | 'onChange'>;

function SingleSelectInternal({
  valueAs,
  ...props
}: SingleSelectInternalProps): React.ReactNode {
  const field = useFieldContext<string | number | null>();

  function toDisplayValue(value: string | number | null): string | null {
    if (value == null) return null;
    return String(value);
  }

  function fromDisplayValue(value: string | null): string | number | null {
    if (value == null) return null;
    if (valueAs === 'string') return value;
    const num = Number(value);
    return Number.isNaN(num) ? null : num;
  }

  return (
    <Select
      value={toDisplayValue(field.state.value)}
      onChange={(value) => field.handleChange(fromDisplayValue(value))}
      error={getFieldError(field.state.meta.errors)}
      {...props}
    />
  );
}

type MultiSelectInternalProps = {
  valueAs: 'string' | 'number';
} & Omit<MultiSelectProps, 'value' | 'onChange'>;

function MultiSelectInternal({
  valueAs,
  ...props
}: MultiSelectInternalProps): React.ReactNode {
  const field = useFieldContext<(string | number)[]>();

  function toDisplayValues(values: (string | number)[]): string[] {
    return (values ?? []).map(String);
  }

  function fromDisplayValues(values: string[]): (string | number)[] {
    if (valueAs === 'string') return values;
    return values.map(Number).filter((n) => !Number.isNaN(n));
  }

  return (
    <MultiSelect
      value={toDisplayValues(field.state.value)}
      onChange={(values) => field.handleChange(fromDisplayValues(values))}
      error={getFieldError(field.state.meta.errors)}
      {...props}
    />
  );
}
