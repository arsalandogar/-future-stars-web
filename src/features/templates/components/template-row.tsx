import { Link } from '@tanstack/react-router';
import { Anchor, Table, Text, Tooltip } from '@mantine/core';

import { formatDate } from '@/utils/date';

import type { Template } from '../types';

interface TemplateRowProps {
  template: Template;
}

export function TemplateRow({ template }: TemplateRowProps) {
  return (
    <>
      <Table.Td>
        <Anchor
          component={Link}
          to={`/admin/templates/${template.id}`}
          fw={500}
        >
          {template.name}
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
        <Text size="sm">{formatDate(template.createdAt)}</Text>
      </Table.Td>
      <Table.Td>
        {template.backTemplate ? (
          <Anchor
            component={Link}
            to={`/admin/templates/${template.backTemplate.id}`}
            size="sm"
          >
            {template.backTemplate.name}
          </Anchor>
        ) : (
          <Text size="sm" c="dimmed">
            —
          </Text>
        )}
      </Table.Td>
    </>
  );
}
