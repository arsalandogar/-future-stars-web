import { ActionIcon, Anchor, Checkbox, Menu, Table, Text } from '@mantine/core';
import { Link } from '@tanstack/react-router';
import { Edit, Eye, MoreHorizontal } from 'lucide-react';

import { MappedBadge } from '@/components/ui/mapped-badge';
import { formatDate } from '@/utils/date';

import { BATCH_STATUS_COLORS } from '../constants';
import { useBatchSelectionStore } from '../stores/batch-selection-store';
import type { PrintBatch } from '../types';

import styles from './batch-row.module.css';

interface BatchRowProps {
  batch: PrintBatch;
  onEdit: (batch: PrintBatch) => void;
}

export function BatchRow({ batch, onEdit }: BatchRowProps) {
  const { selectedBatchIds, toggleBatch } = useBatchSelectionStore();
  const isSelected = selectedBatchIds.has(batch.id);
  const cellClass = isSelected ? styles.selectedCell : undefined;

  return (
    <>
      <Table.Td className={cellClass}>
        <Checkbox
          checked={isSelected}
          onChange={() => toggleBatch(batch.id)}
          radius="xl"
          aria-label={`Select batch ${batch.id}`}
        />
      </Table.Td>
      <Table.Td className={cellClass}>
        <Text size="sm">{batch.id}</Text>
      </Table.Td>
      <Table.Td className={cellClass}>
        <Anchor
          component={Link}
          to={`/admin/batches/${batch.id}`}
          size="sm"
          fw={500}
          c="primary"
        >
          {batch.name}
        </Anchor>
      </Table.Td>
      <Table.Td className={cellClass}>
        <Text size="sm">{formatDate(batch.createdAt)}</Text>
      </Table.Td>
      <Table.Td className={cellClass}>
        <Text size="sm">{batch.totalOrders}</Text>
      </Table.Td>
      <Table.Td className={cellClass}>
        <MappedBadge value={batch.status} colorMap={BATCH_STATUS_COLORS} />
      </Table.Td>
      <Table.Td className={cellClass}>
        <Menu shadow="md" width={160} position="bottom-end">
          <Menu.Target>
            <ActionIcon variant="subtle" color="gray">
              <MoreHorizontal size={16} />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item
              component={Link}
              to={`/admin/batches/${batch.id}`}
              leftSection={<Eye size={14} />}
            >
              View Details
            </Menu.Item>
            <Menu.Item
              leftSection={<Edit size={14} />}
              onClick={() => onEdit(batch)}
            >
              Edit Status
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Table.Td>
    </>
  );
}
