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
  return (
    <Group gap="xs">
      {[{ id: 0, name: null, label: 'All Styles' }, ...categories].map(
        (category) => {
          const isActive = selected === category.name;
          return (
            <Button
              key={category.id}
              size="sm"
              radius="xl"
              color={isActive ? 'primary' : 'secondary'}
              onClick={() => onChange(category.name)}
            >
              {category.label}
            </Button>
          );
        }
      )}
    </Group>
  );
}
