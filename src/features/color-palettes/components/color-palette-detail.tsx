import {
  Stack,
  Group,
  Text,
  Badge,
  ColorSwatch,
  Paper,
  Title,
  Button,
  Table,
  ActionIcon,
  Skeleton,
  Anchor,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Link } from '@tanstack/react-router';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';

import { usePageHeader } from '@/hooks';
import { openDeleteModal } from '@/utils/open-delete-modal';

import { useColorPalette } from '../api/get-color-palette';
import { useDetachTemplatePalette } from '../api/detach-template-palette';
import { AttachTemplateModal } from './attach-template-modal';

interface Props {
  id: number;
}

export function ColorPaletteDetail({ id }: Props) {
  const { data, isLoading } = useColorPalette({ variables: id });
  const detachTemplate = useDetachTemplatePalette();
  const [attachOpened, { open: openAttach, close: closeAttach }] =
    useDisclosure(false);

  const palette = data?.data;

  usePageHeader({
    title: palette?.name ?? 'Color Palette',
    description: 'View palette details and linked templates.',
  });

  const handleDetach = (templateId: number, templateName: string) => {
    openDeleteModal({
      entityType: 'Template Link',
      itemName: templateName,
      onConfirm: () => detachTemplate.mutate({ paletteId: id, templateId }),
    });
  };

  if (isLoading) {
    return (
      <Stack gap="lg" p="md">
        <Skeleton height={30} width={200} />
        <Skeleton height={100} />
        <Skeleton height={200} />
      </Stack>
    );
  }

  if (!palette) {
    return (
      <Text c="dimmed" p="md">
        Palette not found.
      </Text>
    );
  }

  return (
    <Stack gap="lg" p="md">
      <Group>
        <Anchor component={Link} to="/admin/color-palettes" size="sm">
          <Group gap={4}>
            <ArrowLeft size={14} />
            Back to Color Palettes
          </Group>
        </Anchor>
      </Group>

      <Paper p="lg" withBorder>
        <Stack gap="md">
          <Group justify="space-between">
            <Title order={3}>{palette.name}</Title>
            <Badge variant="light" color={palette.isActive ? 'green' : 'gray'}>
              {palette.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </Group>

          <div>
            <Text size="sm" fw={600} mb="xs">
              Color Pairs
            </Text>
            <Group gap="md">
              {palette.colorPairs.map((pair, index) => (
                <Paper
                  key={`${pair.bg}-${index}`}
                  p="xs"
                  withBorder
                  radius="md"
                >
                  <Group gap="xs">
                    <ColorSwatch color={pair.bg} size={24} />
                    <ColorSwatch color={pair.fg} size={24} />
                    <Text size="xs" c="dimmed">
                      #{index + 1}
                    </Text>
                  </Group>
                </Paper>
              ))}
            </Group>
          </div>
        </Stack>
      </Paper>

      <Paper p="lg" withBorder>
        <Group justify="space-between" mb="md">
          <Title order={4}>Linked Templates</Title>
          <Button
            variant="light"
            leftSection={<Plus size={16} />}
            size="sm"
            onClick={openAttach}
          >
            Attach Template
          </Button>
        </Group>

        {palette.templates && palette.templates.length > 0 ? (
          <Table horizontalSpacing="md" verticalSpacing="sm">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>ID</Table.Th>
                <Table.Th>Name</Table.Th>
                <Table.Th w={80}>Rank</Table.Th>
                <Table.Th w={60}>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {palette.templates.map((template) => (
                <Table.Tr key={template.id}>
                  <Table.Td>
                    <Text size="sm">#{template.id}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{template.label ?? template.name}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{template.$extras?.pivot_rank ?? 0}</Text>
                  </Table.Td>
                  <Table.Td>
                    <ActionIcon
                      variant="subtle"
                      color="red"
                      onClick={() =>
                        handleDetach(
                          template.id,
                          template.label ?? template.name
                        )
                      }
                    >
                      <Trash2 size={14} />
                    </ActionIcon>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        ) : (
          <Text c="dimmed" ta="center" py="xl">
            No templates linked to this palette.
          </Text>
        )}
      </Paper>

      <AttachTemplateModal
        paletteId={id}
        opened={attachOpened}
        onClose={closeAttach}
      />
    </Stack>
  );
}
