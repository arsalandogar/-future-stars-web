import { Button, Group } from '@mantine/core';

import type { TagWithTemplates } from '../types';

interface CategoryFilterChipsProps {
  categories: TagWithTemplates[];
  selected: string | null;
  onChange: (category: string | null) => void;
}

export function CategoryFilterChips({
  categories,
  selected,
  onChange,
}: CategoryFilterChipsProps) {
  const isAllSelected = selected === null;

  return (
    <Group gap="xs">
      <Button
        size="sm"
        radius="xl"
        variant={isAllSelected ? 'filled' : 'outline'}
        color={isAllSelected ? 'primary' : 'gray'}
        onClick={() => onChange(null)}
      >
        All Styles
      </Button>
      {categories.map((category) => {
        const isActive = selected === category.name;
        return (
          <Button
            key={category.id}
            size="sm"
            radius="xl"
            variant={isActive ? 'filled' : 'outline'}
            color={isActive ? 'primary' : 'gray'}
            onClick={() => onChange(category.name)}
          >
            {category.label}
          </Button>
        );
      })}
    </Group>
  );
}
