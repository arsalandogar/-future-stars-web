import { Group } from '@mantine/core';

import { ButtonLink } from '@/components/ui/button-link';
import type { Tag } from '@/types';

interface TagFilterChipsProps {
  tags: Tag[];
  selected: string | null;
}

export function TagFilterChips({ tags, selected }: TagFilterChipsProps) {
  return (
    <Group gap="xs">
      {[{ id: 0, name: null, label: 'All Styles' }, ...tags].map((tag) => {
        const isActive = selected === tag.name;
        return (
          <ButtonLink
            key={tag.id}
            to="/templates"
            search={{ tag: tag.name ?? undefined }}
            size="sm"
            radius="xl"
            color={isActive ? 'primary' : 'secondary'}
          >
            {tag.label}
          </ButtonLink>
        );
      })}
    </Group>
  );
}
