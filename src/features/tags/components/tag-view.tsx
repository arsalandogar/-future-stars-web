import { Badge, Button, Card, Group, Stack, Text, Title } from '@mantine/core';
import { Edit, Trash2 } from 'lucide-react';

import { formatDate } from '@/utils/date';

import type { TagWithTemplates } from '../types';

import { TagTemplatesList } from './tag-templates-list';

interface TagViewProps {
  tag: TagWithTemplates;
  onEdit: () => void;
  onDelete: () => void;
}

export function TagView({ tag, onEdit, onDelete }: TagViewProps) {
  return (
    <Stack gap="lg">
      <Card withBorder radius="md" p="lg">
        <Group justify="space-between" align="flex-start">
          <div>
            <Group gap="sm" align="center">
              <Title order={3}>{tag.name}</Title>
              <Badge variant="light">{tag.label}</Badge>
            </Group>
            {tag.description && (
              <Text size="sm" c="dimmed" mt="xs">
                {tag.description}
              </Text>
            )}
            {tag.createdAt && (
              <Text size="sm" c="dimmed">
                Created: {formatDate(tag.createdAt)}
              </Text>
            )}
          </div>
          <Group gap="sm">
            <Button
              variant="default"
              leftSection={<Edit size={16} />}
              onClick={onEdit}
            >
              Edit
            </Button>
            <Button
              variant="light"
              color="red"
              leftSection={<Trash2 size={16} />}
              onClick={onDelete}
            >
              Delete
            </Button>
          </Group>
        </Group>
      </Card>

      <Card withBorder radius="md" p="lg">
        <Title order={5} mb="md">
          Templates ({tag.templates.length})
        </Title>
        <TagTemplatesList tag={tag} />
      </Card>
    </Stack>
  );
}
