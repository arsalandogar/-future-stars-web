import {
  Badge,
  Button,
  Card,
  Group,
  Stack,
  Text,
  Title,
  TypographyStylesProvider,
} from '@mantine/core';
import { Link } from '@tanstack/react-router';
import { Edit, Send, Trash2, Plus, History } from 'lucide-react';

import { formatDate } from '@/utils/date';

import type { LegalDocument } from '../types';

interface LegalDocumentViewProps {
  document: LegalDocument;
  onPublish: () => void;
  onDelete: () => void;
}

export function LegalDocumentView({
  document,
  onPublish,
  onDelete,
}: LegalDocumentViewProps) {
  const basePath = `/admin/legal/${document.type}`;
  const status = document.isDraft ? 'draft' : 'published';
  const statusColor = document.isDraft ? 'gray' : 'green';

  return (
    <Stack gap="lg">
      <Card withBorder radius="md" p="lg">
        <Stack gap="md">
          <Group justify="space-between" align="flex-start">
            <div>
              <Group gap="sm" align="center">
                <Title order={3}>Version {document.version}</Title>
                <Badge color={statusColor} variant="light">
                  {status}
                </Badge>
              </Group>
              <Text size="sm" c="dimmed" mt="xs">
                Created by {document.creator.firstName}{' '}
                {document.creator.lastName}
                {document.createdAt && ` on ${formatDate(document.createdAt)}`}
              </Text>
              {document.publishedAt && document.publisher && (
                <Text size="sm" c="dimmed">
                  Published by {document.publisher.firstName}{' '}
                  {document.publisher.lastName} on{' '}
                  {formatDate(document.publishedAt)}
                </Text>
              )}
              {document.isPublished && (
                <Text size="sm" c="dimmed">
                  Requires acceptance:{' '}
                  {document.requiresAcceptance ? 'Yes' : 'No'}
                </Text>
              )}
            </div>
            <Group gap="sm">
              <Button
                component={Link}
                to={`${basePath}/versions`}
                variant="subtle"
                leftSection={<History size={16} />}
                aria-label="View version history"
              >
                Version History
              </Button>
              {document.isDraft ? (
                <>
                  <Button
                    component={Link}
                    to={`${basePath}/${document.id}/edit`}
                    variant="default"
                    leftSection={<Edit size={16} />}
                    aria-label="Edit document"
                  >
                    Edit
                  </Button>
                  <Button
                    leftSection={<Send size={16} />}
                    onClick={onPublish}
                    aria-label="Publish document"
                  >
                    Publish
                  </Button>
                  <Button
                    variant="light"
                    color="red"
                    leftSection={<Trash2 size={16} />}
                    onClick={onDelete}
                    aria-label="Delete document"
                  >
                    Delete
                  </Button>
                </>
              ) : (
                <Button
                  component={Link}
                  to={`${basePath}/create`}
                  variant="default"
                  leftSection={<Plus size={16} />}
                  aria-label="Create new version"
                >
                  Create New Version
                </Button>
              )}
            </Group>
          </Group>
        </Stack>
      </Card>

      <Card withBorder radius="md" p="lg">
        <Title order={5} mb="md">
          Content Preview
        </Title>
        <TypographyStylesProvider>
          <div dangerouslySetInnerHTML={{ __html: document.content }} />
        </TypographyStylesProvider>
      </Card>
    </Stack>
  );
}
