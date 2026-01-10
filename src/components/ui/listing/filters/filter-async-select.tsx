import { useState } from 'react';
import { Loader, Select } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';

export interface FilterAsyncSelectOption {
  value: string;
  label: string;
}

export interface FilterAsyncSelectProps {
  label: string;
  placeholder?: string;
  value: string | undefined;
  onChange: (value: string | null) => void;
  options: FilterAsyncSelectOption[];
  isLoading?: boolean;
  onSearchChange?: (search: string) => void;
  selectedOption?: FilterAsyncSelectOption | null;
  isLoadingSelected?: boolean;
  minSearchLength?: number;
}

export function FilterAsyncSelect({
  label,
  placeholder,
  value,
  onChange,
  options,
  isLoading = false,
  onSearchChange,
  selectedOption,
  isLoadingSelected = false,
  minSearchLength = 2,
}: FilterAsyncSelectProps) {
  const [searchValue, setSearchValue] = useState('');
  const [debouncedSearch] = useDebouncedValue(searchValue, 300);

  // Notify parent of search changes
  const handleSearchChange = (search: string) => {
    setSearchValue(search);
    if (onSearchChange && search.length >= minSearchLength) {
      onSearchChange(search);
    }
  };

  // Build options list, including selected option if not in search results
  const displayOptions = [...options];
  if (
    selectedOption &&
    !displayOptions.find((o) => o.value === selectedOption.value)
  ) {
    displayOptions.unshift(selectedOption);
  }

  const showLoader = isLoading || isLoadingSelected;

  return (
    <Select
      label={label}
      placeholder={placeholder ?? `Select ${label.toLowerCase()}`}
      data={displayOptions}
      value={value ?? null}
      onChange={onChange}
      searchable
      searchValue={searchValue}
      onSearchChange={handleSearchChange}
      clearable
      nothingFoundMessage={
        debouncedSearch.length < minSearchLength
          ? 'Type to search...'
          : 'No results found'
      }
      rightSection={showLoader ? <Loader size={16} /> : undefined}
      size="sm"
    />
  );
}
