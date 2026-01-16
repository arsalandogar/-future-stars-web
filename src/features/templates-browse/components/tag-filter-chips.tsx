import { Button, Group } from '@mantine/core';

import type { TagWithTemplates } from '../types';

interface TagFilterChipsProps {
  tags: TagWithTemplates[];
  selected: string | null;
  onChange: (tag: string | null) => void;
}

export function TagFilterChips({
  tags,
  selected,
  onChange,
}: TagFilterChipsProps) {
  return (
    <Group gap="xs">
      {[{ id: 0, name: null, label: 'All Styles' }, ...tags].map((tag) => {
        const isActive = selected === tag.name;
        return (
          <Button
            key={tag.id}
            size="sm"
            radius="xl"
            color={isActive ? 'primary' : 'secondary'}
            onClick={() => onChange(tag.name)}
          >
            {tag.label}
          </Button>
        );
      })}
    </Group>
  );
}
