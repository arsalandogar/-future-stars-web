/* eslint-disable react-dom/no-dangerously-set-innerhtml */
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
import { MoreHorizontal, Tags } from 'lucide-react';

import { formatDate } from '@/utils/date';

import type { Template } from '../types';

interface TemplateRowProps {
  template: Template;
  onSetTags: (template: Template) => void;
}

export function TemplateRow({ template, onSetTags }: TemplateRowProps) {
  return (
    <>
      <Table.Td>
        <div
          className="h-12 w-12 overflow-hidden rounded border border-gray-200 [&>svg]:h-full [&>svg]:w-full"
          dangerouslySetInnerHTML={{ __html: template.svgString }}
        />
      </Table.Td>
      <Table.Td>
        {template.backTemplate ? (
          <Anchor
            component={Link}
            to={`/admin/templates/${template.backTemplate.id}`}
          >
            <div
              className="h-12 w-12 overflow-hidden rounded border border-gray-200 [&>svg]:h-full [&>svg]:w-full"
              dangerouslySetInnerHTML={{
                __html: template.backTemplate.svgString,
              }}
            />
          </Anchor>
        ) : (
          <Text size="sm" c="dimmed">
            —
          </Text>
        )}
      </Table.Td>
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
              leftSection={<Tags size={14} />}
              onClick={() => onSetTags(template)}
            >
              Set Tags
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Table.Td>
    </>
  );
}
