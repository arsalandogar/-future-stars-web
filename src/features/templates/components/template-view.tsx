import {
  Badge,
  Box,
  Button,
  Card,
  Group,
  Image,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { Link } from '@tanstack/react-router';
import { Edit, PenLine, SlidersHorizontal, Trash2 } from 'lucide-react';

import { formatDate } from '@/utils/date';

import type { Template } from '../types';

interface TemplatePreviewCardProps {
  template: Template;
}

function TemplatePreviewCard({
  template,
}: TemplatePreviewCardProps): React.ReactNode {
  const backTemplate = template.backTemplate ?? template.defaultBackTemplate;
  const isDefaultBack =
    !template.backTemplate && Boolean(template.defaultBackTemplate);

  return (
    <Card withBorder radius="md" p="lg">
      <Title order={5} mb="md">
        Template Preview
      </Title>
      {backTemplate ? (
        <SimpleGrid cols={{ base: 1, md: 2 }}>
          <Box className="flex flex-col items-center">
            <Text size="sm" fw={500} c="dimmed" mb="xs" tt="capitalize">
              {template.side}
            </Text>
            <div className="inline-flex">
              <Image
                src={template.templateImage}
                alt={template.label}
                h={208}
                fit="contain"
                className="rounded border p-2"
              />
            </div>
          </Box>
          <Box className="flex flex-col items-center">
            <Group gap="xs" mb="xs">
              <Text size="sm" fw={500} c="dimmed" tt="capitalize">
                {backTemplate.side}
              </Text>
              {isDefaultBack && (
                <Badge size="xs" variant="light" color="yellow">
                  Default
                </Badge>
              )}
            </Group>
            <Link
              to="/admin/templates/$id"
              params={{ id: String(backTemplate.id) }}
              className="inline-flex no-underline"
            >
              <Image
                src={backTemplate.templateImage}
                alt={backTemplate.name}
                h={208}
                fit="contain"
                className="rounded border p-2"
              />
            </Link>
            <Text size="xs" c="dimmed" mt="xs">
              Click to view back template
            </Text>
          </Box>
        </SimpleGrid>
      ) : (
        <Box className="flex flex-col items-center">
          <Image
            src={template.templateImage}
            alt={template.label}
            h={208}
            fit="contain"
            className="rounded border p-2"
          />
        </Box>
      )}
    </Card>
  );
}

interface TemplateViewProps {
  template: Template;
  onDelete: () => void;
}

export function TemplateView({ template, onDelete }: TemplateViewProps) {
  return (
    <Stack gap="lg">
      {/* Header Card */}
      <Card withBorder radius="md" p="lg">
        <Group justify="space-between" align="flex-start">
          <div>
            <Group gap="sm" align="center">
              <Title order={3}>{template.label}</Title>
              <Badge variant="light" tt="uppercase">
                {template.side}
              </Badge>
              <Badge
                variant="light"
                color={template.isPublished ? 'green' : 'gray'}
              >
                {template.isPublished ? 'Published' : 'Draft'}
              </Badge>
            </Group>
            <Text size="sm" c="dimmed" mt="xs">
              Type: {template.type.name}
            </Text>
            <Text size="sm" c="dimmed">
              Created: {formatDate(template.createdAt)}
            </Text>
            {template.name && (
              <Text size="sm" c="dimmed">
                Name: {template.name}
              </Text>
            )}
          </div>
          <Group gap="sm">
            <Button
              component={Link}
              to={`/admin/templates/${template.id}/defaults`}
              variant="default"
              leftSection={<SlidersHorizontal size={16} />}
            >
              Edit Defaults
            </Button>
            <Button
              component={Link}
              to={`/admin/templates/${template.id}/annotate`}
              variant="default"
              leftSection={<PenLine size={16} />}
            >
              Annotate
            </Button>
            <Button
              component={Link}
              to={`/admin/templates/${template.id}/edit`}
              variant="default"
              leftSection={<Edit size={16} />}
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

      {/* SVG Preview - Front and Back side by side */}
      <TemplatePreviewCard template={template} />

      {/* Description */}
      {template.description && (
        <Card withBorder radius="md" p="lg">
          <Title order={5} mb="md">
            Description
          </Title>
          <Text>{template.description}</Text>
        </Card>
      )}

      {/* Tags */}
      {template.tags.length > 0 && (
        <Card withBorder radius="md" p="lg">
          <Title order={5} mb="md">
            Tags
          </Title>
          <Group gap="xs">
            {template.tags.map((tag) => (
              <Badge key={tag.id} variant="light">
                {tag.label}
              </Badge>
            ))}
          </Group>
        </Card>
      )}
    </Stack>
  );
}
