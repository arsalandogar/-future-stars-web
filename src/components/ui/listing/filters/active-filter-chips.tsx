import { ActionIcon, Badge, Button, Group } from '@mantine/core';
import { X } from 'lucide-react';

export interface ActiveFilter {
  key: string;
  label: string;
  displayValue: string;
}

export interface ActiveFilterChipsProps {
  filters: ActiveFilter[];
  onRemove: (key: string) => void;
  onClearAll: () => void;
}

export function ActiveFilterChips({
  filters,
  onRemove,
  onClearAll,
}: ActiveFilterChipsProps) {
  if (filters.length === 0) return null;

  return (
    <Group gap="xs">
      {filters.map((filter) => (
        <Badge
          key={filter.key}
          variant="light"
          pr={3}
          rightSection={
            <ActionIcon
              size="xs"
              variant="transparent"
              color="gray"
              onClick={() => onRemove(filter.key)}
              aria-label={`Remove ${filter.label} filter`}
            >
              <X size={12} />
            </ActionIcon>
          }
        >
          {filter.label}: {filter.displayValue}
        </Badge>
      ))}
      <Button variant="subtle" size="xs" onClick={onClearAll}>
        Clear all
      </Button>
    </Group>
  );
}
