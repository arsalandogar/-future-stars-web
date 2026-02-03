import { ActionIcon, Anchor, Checkbox, Menu, Table, Text } from '@mantine/core';
import { Link } from '@tanstack/react-router';
import { MoreHorizontal, Package, RefreshCw, Trash2 } from 'lucide-react';

import {
  useAddToBatchModalStore,
  useRemoveOrdersFromBatch,
} from '@/features/print-batches';

import { MappedBadge } from '@/components/ui/mapped-badge';
import { formatCurrency } from '@/utils/currency';
import { formatDate } from '@/utils/date';

import { useUpdateShipmentStatus } from '../api/update-shipment-status';
import { ORDER_STATUS_COLORS, SHIPMENT_STATUS_COLORS } from '../constants';
import { useOrderSelectionStore } from '../stores/order-selection-store';
import type { Order, ShipmentStatus } from '../types';

import styles from './order-row.module.css';

interface OrderRowProps {
  order: Order;
}

const SHIPMENT_STATUSES: ShipmentStatus[] = ['printing', 'shipped'];

export function OrderRow({ order }: OrderRowProps) {
  const { selectedOrderIds, toggleOrder } = useOrderSelectionStore();
  const { open: openAddToBatchModal } = useAddToBatchModalStore();
  const updateShipmentStatus = useUpdateShipmentStatus();
  const removeFromBatch = useRemoveOrdersFromBatch();

  const isSelected = selectedOrderIds.has(order.id);
  const cellClass = isSelected ? styles.selectedCell : undefined;
  const customerName = `${order.user.firstName} ${order.user.lastName}`;
  const packCount = order.lineItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );
  const isInBatch = !!order.printBatch;

  const handleShipmentStatusChange = (shipmentStatus: ShipmentStatus) => {
    updateShipmentStatus.mutate({ orderId: order.id, shipmentStatus });
  };

  const handleMoveToBatch = () => {
    openAddToBatchModal([order.id], isInBatch ? [order.id] : []);
  };

  const handleRemoveFromBatch = () => {
    if (order.printBatch) {
      removeFromBatch.mutate({
        batchId: order.printBatch.id,
        orderIds: [order.id],
      });
    }
  };

  return (
    <>
      <Table.Td className={cellClass}>
        <Checkbox
          checked={isSelected}
          onChange={() => toggleOrder(order.id)}
          radius="xl"
          aria-label={`Select order ${order.id}`}
        />
      </Table.Td>
      <Table.Td className={cellClass}>
        <Anchor size="sm" fw={500} c="primary">
          {order.id}
        </Anchor>
      </Table.Td>
      <Table.Td className={cellClass}>
        <Text size="sm">{customerName}</Text>
        <Text size="xs" c="dimmed">
          {order.user.email}
        </Text>
      </Table.Td>
      <Table.Td className={cellClass}>
        <Text size="sm">{formatDate(order.createdAt)}</Text>
      </Table.Td>
      <Table.Td className={cellClass}>
        {order.printBatch ? (
          <Link
            to="/admin/batches/$batchId"
            params={{ batchId: String(order.printBatch.id) }}
            className="text-sm font-medium text-[var(--mantine-color-primary-6)] no-underline hover:underline"
          >
            {order.printBatch.name}
          </Link>
        ) : (
          <Text size="sm" c="dimmed">
            —
          </Text>
        )}
      </Table.Td>
      <Table.Td className={cellClass}>
        <Text size="sm">{packCount}</Text>
      </Table.Td>
      <Table.Td className={cellClass}>
        <Text size="sm" fw={500}>
          {formatCurrency(order.totalAmount)}
        </Text>
      </Table.Td>
      <Table.Td className={cellClass}>
        <MappedBadge value={order.status} colorMap={ORDER_STATUS_COLORS} />
      </Table.Td>
      <Table.Td className={cellClass}>
        <MappedBadge
          value={order.shipmentStatus}
          colorMap={SHIPMENT_STATUS_COLORS}
        />
      </Table.Td>
      <Table.Td className={cellClass}>
        <Menu shadow="md" width={260} position="bottom-end">
          <Menu.Target>
            <ActionIcon variant="subtle" color="gray">
              <MoreHorizontal size={16} />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu trigger="hover" position="left-start" offset={2}>
              <Menu.Target>
                <Menu.Item leftSection={<RefreshCw size={14} />}>
                  Change Fulfillment Status
                </Menu.Item>
              </Menu.Target>
              <Menu.Dropdown>
                {SHIPMENT_STATUSES.map((status) => (
                  <Menu.Item
                    key={status}
                    onClick={() => handleShipmentStatusChange(status)}
                    disabled={order.shipmentStatus === status}
                  >
                    {status}
                  </Menu.Item>
                ))}
              </Menu.Dropdown>
            </Menu>
            <Menu.Item
              leftSection={<Package size={14} />}
              onClick={handleMoveToBatch}
            >
              Move to Batch
            </Menu.Item>
            {isInBatch && (
              <Menu.Item
                leftSection={<Trash2 size={14} />}
                color="red"
                onClick={handleRemoveFromBatch}
              >
                Remove from Batch
              </Menu.Item>
            )}
          </Menu.Dropdown>
        </Menu>
      </Table.Td>
    </>
  );
}
