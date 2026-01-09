import { Link } from '@tanstack/react-router';
import {
  ActionIcon,
  Anchor,
  Badge,
  Group,
  Menu,
  Table,
  Text,
  Tooltip,
} from '@mantine/core';
import { Edit, Eye, MoreHorizontal, Star, Tags } from 'lucide-react';

import { SvgPreview } from '@/components/svg-preview';
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

const SVG_PREVIEW_PROPS = {
  className: 'h-12 w-12 rounded border border-gray-200',
  svgClassName: '[&>svg]:h-full [&>svg]:w-full',
  hideErrors: true,
} as const;

const DEFAULT_BACK_PREVIEW_PROPS = {
  className: 'h-12 w-12 rounded border-2 border-dashed border-yellow-500/50',
  svgClassName: '[&>svg]:h-full [&>svg]:w-full',
  hideErrors: true,
} as const;

function BackTemplatePreview({
  template,
}: {
  template: Template;
}): React.ReactNode {
  const backTemplate = template.backTemplate ?? template.defaultBackTemplate;

  if (!backTemplate) {
    return (
      <Text size="sm" c="dimmed">
        —
      </Text>
    );
  }

  const isDefault = !template.backTemplate && template.defaultBackTemplate;
  const previewProps = isDefault
    ? DEFAULT_BACK_PREVIEW_PROPS
    : SVG_PREVIEW_PROPS;

  return (
    <Anchor component={Link} to={`/admin/templates/${backTemplate.id}`}>
      <SvgPreview svgString={backTemplate.svgString ?? ''} {...previewProps} />
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
        <SvgPreview svgString={template.svgString} {...SVG_PREVIEW_PROPS} />
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
