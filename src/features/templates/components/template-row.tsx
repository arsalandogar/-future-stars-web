import { Link } from '@tanstack/react-router';
import {
  ActionIcon,
  Anchor,
  Badge,
  Group,
  Image,
  Menu,
  Table,
  Text,
  Tooltip,
} from '@mantine/core';
import {
  Edit,
  Eye,
  MoreHorizontal,
  PenLine,
  SlidersHorizontal,
  Star,
  Tags,
} from 'lucide-react';

import { formatDate } from '@/utils/date';

import type { Template, TemplateSide } from '../types';

interface TemplateRowProps {
  template: Template;
  side: TemplateSide;
  onSetTags?: (template: Template) => void;
  onSetDefaultBack?: (template: Template) => void;
  hideTags?: boolean;
  hideBack?: boolean;
}

interface BackTemplatePreviewProps {
  template: Template;
}

function BackTemplatePreview({
  template,
}: BackTemplatePreviewProps): React.ReactNode {
  const backTemplate = template.backTemplate ?? template.defaultBackTemplate;

  if (!backTemplate) {
    return (
      <Text size="sm" c="dimmed">
        —
      </Text>
    );
  }

  const isDefault = !template.backTemplate && template.defaultBackTemplate;

  return (
    <Anchor component={Link} to={`/admin/templates/${backTemplate.id}`}>
      <Image
        src={backTemplate.templateImageMedium}
        alt={backTemplate.name}
        h={48}
        w={48}
        fit="contain"
        className={
          isDefault
            ? 'rounded border-2 border-dashed border-yellow-500/50'
            : 'rounded border border-gray-200'
        }
      />
    </Anchor>
  );
}

export function TemplateRow({
  template,
  side,
  onSetTags,
  onSetDefaultBack,
  hideTags,
  hideBack,
}: TemplateRowProps) {
  return (
    <>
      <Table.Td>
        <Image
          src={template.templateImageMedium}
          alt={template.label}
          h={48}
          w={48}
          fit="contain"
          className="rounded border border-gray-200"
        />
      </Table.Td>
      {side === 'front' && !hideBack && (
        <Table.Td>
          <BackTemplatePreview template={template} />
        </Table.Td>
      )}
      <Table.Td>
        <Group gap="xs">
          <Anchor
            component={Link}
            to={`/admin/templates/${template.id}`}
            fw={500}
          >
            {template.label}
          </Anchor>
          {template.isDefaultBack && (
            <Badge size="xs" variant="light" color="yellow">
              Default
            </Badge>
          )}
        </Group>
      </Table.Td>
      <Table.Td>
        <Badge
          variant="light"
          color={template.isPublished ? 'green' : 'gray'}
          size="sm"
        >
          {template.isPublished ? 'Yes' : 'No'}
        </Badge>
      </Table.Td>
      <Table.Td>
        {template.description ? (
          <Tooltip label={template.description} multiline maw={300}>
            <Text size="sm" lineClamp={2}>
              {template.description}
            </Text>
          </Tooltip>
        ) : (
          <Text size="sm" c="dimmed">
            —
          </Text>
        )}
      </Table.Td>
      {!hideTags && (
        <Table.Td>
          {template.tags.length > 0 ? (
            <Group gap="xs">
              {template.tags.map((tag) => (
                <Badge key={tag.id} variant="light" size="sm">
                  {tag.label}
                </Badge>
              ))}
            </Group>
          ) : (
            <Text size="sm" c="dimmed">
              —
            </Text>
          )}
        </Table.Td>
      )}
      <Table.Td>
        <Text size="sm">{formatDate(template.createdAt)}</Text>
      </Table.Td>
      <Table.Td>
        <Menu shadow="md" width={160} position="bottom-end">
          <Menu.Target>
            <ActionIcon variant="subtle" color="gray">
              <MoreHorizontal size={16} />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item
              component={Link}
              to={`/admin/templates/${template.id}`}
              leftSection={<Eye size={14} />}
            >
              View
            </Menu.Item>
            <Menu.Item
              component={Link}
              to={`/admin/templates/${template.id}/edit`}
              leftSection={<Edit size={14} />}
            >
              Edit
            </Menu.Item>
            <Menu.Item
              component={Link}
              to={`/admin/templates/${template.id}/annotate`}
              leftSection={<PenLine size={14} />}
            >
              Annotate
            </Menu.Item>
            <Menu.Item
              component={Link}
              to={`/admin/templates/${template.id}/defaults`}
              leftSection={<SlidersHorizontal size={14} />}
            >
              Edit Defaults
            </Menu.Item>
            {onSetTags && (
              <>
                <Menu.Divider />
                <Menu.Item
                  leftSection={<Tags size={14} />}
                  onClick={() => onSetTags(template)}
                >
                  Set Tags
                </Menu.Item>
              </>
            )}
            {side === 'back' && onSetDefaultBack && (
              <Menu.Item
                leftSection={<Star size={14} />}
                onClick={() => onSetDefaultBack(template)}
              >
                Set as Default Back
              </Menu.Item>
            )}
          </Menu.Dropdown>
        </Menu>
      </Table.Td>
    </>
  );
}
