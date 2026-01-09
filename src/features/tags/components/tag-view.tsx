import { useMemo } from 'react';
import { Badge, Button, Card, Group, Stack, Text, Title } from '@mantine/core';
import { Edit, Trash2 } from 'lucide-react';

import { formatDate } from '@/utils/date';

import type { TagWithTemplates } from '../types';

import { TagBackTemplatesList } from './tag-back-templates-list';
import { TagTemplatesList } from './tag-templates-list';

interface TagViewProps {
  tag: TagWithTemplates;
  onEdit: () => void;
  onDelete: () => void;
}

export function TagView({ tag, onEdit, onDelete }: TagViewProps) {
  const frontTemplates = useMemo(
    () => tag.templates.filter((t) => t.side === 'front'),
    [tag.templates]
  );
  const backTemplates = useMemo(
    () => tag.templates.filter((t) => t.side === 'back'),
    [tag.templates]
  );

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
          Front Templates ({frontTemplates.length})
        </Title>
        <TagTemplatesList tag={tag} templates={frontTemplates} />
      </Card>

      <Card withBorder radius="md" p="lg">
        <Title order={5} mb="md">
          Back Templates ({backTemplates.length})
        </Title>
        <TagBackTemplatesList templates={backTemplates} />
      </Card>
    </Stack>
  );
}
