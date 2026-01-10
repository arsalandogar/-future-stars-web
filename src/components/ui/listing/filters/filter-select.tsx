import { Select } from '@mantine/core';

export interface FilterSelectProps {
  label: string;
  placeholder?: string;
  options: { value: string; label: string }[];
  value: string | undefined;
  onChange: (value: string | null) => void;
}

export function FilterSelect({
  label,
  placeholder,
  options,
  value,
  onChange,
}: FilterSelectProps) {
  return (
    <Select
      label={label}
      placeholder={placeholder ?? `All ${label.toLowerCase()}`}
      data={options}
      value={value ?? null}
      onChange={onChange}
      clearable
      size="sm"
    />
  );
}
