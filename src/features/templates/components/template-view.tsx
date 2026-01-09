import {
  Badge,
  Box,
  Button,
  Card,
  Group,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { Link } from '@tanstack/react-router';
import { Edit, Trash2 } from 'lucide-react';

import { SvgPreview } from '@/components/svg-preview';
import { formatDate } from '@/utils/date';

import type { Template } from '../types';
import { AttributesTable } from './attributes-table';

const SVG_PREVIEW_PROPS = {
  className: 'rounded border p-2',
  svgClassName: '[&>svg]:h-52 [&>svg]:w-auto',
  hideErrors: true,
} as const;

function TemplatePreviewCard({
  template,
}: {
  template: Template;
}): React.ReactNode {
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
            <SvgPreview svgString={template.svgString} {...SVG_PREVIEW_PROPS} />
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
              <SvgPreview
                svgString={backTemplate.svgString ?? ''}
                {...SVG_PREVIEW_PROPS}
              />
            </Link>
            <Text size="xs" c="dimmed" mt="xs">
              Click to view back template
            </Text>
          </Box>
        </SimpleGrid>
      ) : (
        <Box className="flex flex-col items-center">
          <SvgPreview svgString={template.svgString} {...SVG_PREVIEW_PROPS} />
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

      {/* Attributes Table */}
      {template.attributes.length > 0 && (
        <Card withBorder radius="md" p="lg">
          <Title order={5} mb="md">
            Attributes
          </Title>
          <AttributesTable mode="view" attributes={template.attributes} />
        </Card>
      )}
    </Stack>
  );
}
