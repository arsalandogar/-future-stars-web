import { ActionIcon, Anchor, Menu, Table, Text } from '@mantine/core';
import { Link } from '@tanstack/react-router';
import { Edit, Send, Trash2, MoreHorizontal } from 'lucide-react';

import { MappedBadge } from '@/components/ui/mapped-badge';
import { formatDate } from '@/utils/date';

import type { LegalDocument, LegalDocumentType } from '../types';

const STATUS_COLORS: Record<string, string> = {
  draft: 'gray',
  published: 'green',
};

interface LegalDocumentRowProps {
  document: LegalDocument;
  type: LegalDocumentType;
  onPublish: (doc: LegalDocument) => void;
  onDelete: (doc: LegalDocument) => void;
}

export function LegalDocumentRow({
  document,
  type,
  onPublish,
  onDelete,
}: LegalDocumentRowProps) {
  const basePath = `/admin/${type}`;
  const status = document.isDraft ? 'draft' : 'published';

  return (
    <>
      <Table.Td>
        <Anchor
          component={Link}
          to={`${basePath}/${document.id}`}
          size="sm"
          fw={500}
        >
          {document.version}
        </Anchor>
      </Table.Td>
      <Table.Td>
        <MappedBadge value={status} colorMap={STATUS_COLORS} />
      </Table.Td>
      <Table.Td>
        <Text size="sm">
          {document.publishedAt ? formatDate(document.publishedAt) : '-'}
        </Text>
      </Table.Td>
      <Table.Td>
        <Menu shadow="md" width={160} position="bottom-end">
          <Menu.Target>
            <ActionIcon
              variant="subtle"
              color="gray"
              aria-label={`Actions for version ${document.version}`}
            >
              <MoreHorizontal size={16} />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item
              component={Link}
              to={`${basePath}/${document.id}/edit`}
              leftSection={<Edit size={14} />}
              disabled={!document.isDraft}
            >
              Edit
            </Menu.Item>
            <Menu.Item
              leftSection={<Send size={14} />}
              disabled={!document.isDraft}
              onClick={() => onPublish(document)}
            >
              Publish
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item
              color="red"
              leftSection={<Trash2 size={14} />}
              disabled={!document.isDraft}
              onClick={() => onDelete(document)}
            >
              Delete
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Table.Td>
    </>
  );
}
