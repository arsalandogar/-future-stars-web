import { MultiSelect } from '@mantine/core';

export interface FilterMultiSelectProps {
  label: string;
  placeholder?: string;
  options: { value: string; label: string }[];
  value: string[];
  onChange: (value: string[]) => void;
}

export function FilterMultiSelect({
  label,
  placeholder,
  options,
  value,
  onChange,
}: FilterMultiSelectProps) {
  return (
    <MultiSelect
      label={label}
      placeholder={placeholder ?? `Select ${label.toLowerCase()}`}
      data={options}
      value={value}
      onChange={onChange}
      clearable
      searchable
      size="sm"
    />
  );
}
