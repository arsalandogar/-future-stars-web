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
import { Edit, Eye, MoreHorizontal, Tags } from 'lucide-react';

import { SvgPreview } from '@/components/svg-preview';
import { formatDate } from '@/utils/date';

import type { Template, TemplateSide } from '../types';

interface TemplateRowProps {
  template: Template;
  side: TemplateSide;
  onSetTags?: (template: Template) => void;
  hideTags?: boolean;
  hideBack?: boolean;
}

const SVG_PREVIEW_PROPS = {
  className: 'h-12 w-12 rounded border border-gray-200',
  svgClassName: '[&>svg]:h-full [&>svg]:w-full',
  hideErrors: true,
} as const;

export function TemplateRow({
  template,
  side,
  onSetTags,
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
          {template.backTemplate ? (
            <Anchor
              component={Link}
              to={`/admin/templates/${template.backTemplate.id}`}
            >
              <SvgPreview
                svgString={template.backTemplate.svgString ?? ''}
                {...SVG_PREVIEW_PROPS}
              />
            </Anchor>
          ) : (
            <Text size="sm" c="dimmed">
              —
            </Text>
          )}
        </Table.Td>
      )}
      <Table.Td>
        <Anchor
          component={Link}
          to={`/admin/templates/${template.id}`}
          fw={500}
        >
          {template.label}
        </Anchor>
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
          </Menu.Dropdown>
        </Menu>
      </Table.Td>
    </>
  );
}
