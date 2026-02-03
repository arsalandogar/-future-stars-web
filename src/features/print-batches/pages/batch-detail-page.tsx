import { useState } from 'react';
import {
  Anchor,
  Button,
  Card,
  Checkbox,
  Group,
  Menu,
  Skeleton,
  Stack,
  Table,
  Text,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { Link } from '@tanstack/react-router';
import {
  ChevronDown,
  MoreHorizontal,
  Package,
  Plus,
  Printer,
  Trash2,
} from 'lucide-react';

import { SHIPMENT_STATUS_COLORS } from '@/features/orders';

import { MappedBadge } from '@/components/ui/mapped-badge';
import { Head } from '@/components/seo/head';
import { usePageHeader } from '@/hooks/use-page-header';
import { formatCurrency } from '@/utils/currency';
import { formatDate, formatDateTime } from '@/utils/date';

import { usePrintBatch } from '../api/get-print-batch';
import { useRemoveOrdersFromBatch } from '../api/remove-orders-from-batch';
import { BATCH_STATUS_COLORS } from '../constants';
import { BatchStatusModal } from '../components/batch-status-modal';
import { BatchNameModal } from '../components/batch-name-modal';
import { useAddToBatchModalStore } from '../stores/add-to-batch-modal-store';

import styles from './batch-detail-page.module.css';

interface BatchDetailPageProps {
  batchId: number;
}

export function BatchDetailPage({ batchId }: BatchDetailPageProps) {
  const [selectedOrderIds, setSelectedOrderIds] = useState<Set<number>>(
    () => new Set()
  );
  const [
    statusModalOpened,
    { open: openStatusModal, close: closeStatusModal },
  ] = useDisclosure(false);
  const [nameModalOpened, { open: openNameModal, close: closeNameModal }] =
    useDisclosure(false);

  const batchQuery = usePrintBatch({ variables: batchId });
  const removeFromBatch = useRemoveOrdersFromBatch();
  const { open: openAddToBatchModal } = useAddToBatchModalStore();

  const batch = batchQuery.data?.data;
  const orders = batch?.orders ?? [];

  usePageHeader({
    title: batch?.name ?? 'Batch Details',
    description: 'View and manage batch details',
    dynamicBreadcrumb: batch?.name,
  });

  const selectedCount = selectedOrderIds.size;
  const allCurrentPageSelected =
    orders.length > 0 &&
    orders.every((order) => selectedOrderIds.has(order.id));

  const handleSelectAllToggle = () => {
    if (allCurrentPageSelected) {
      setSelectedOrderIds(new Set());
    } else {
      setSelectedOrderIds(new Set(orders.map((order) => order.id)));
    }
  };

  const toggleOrderSelection = (orderId: number) => {
    const newSet = new Set(selectedOrderIds);
    if (newSet.has(orderId)) {
      newSet.delete(orderId);
    } else {
      newSet.add(orderId);
    }
    setSelectedOrderIds(newSet);
  };

  const handleMoveToBatch = (orderId: number) => {
    openAddToBatchModal([orderId], [orderId]);
  };

  const handleRemoveOrder = (orderId: number) => {
    removeFromBatch.mutate(
      { batchId, orderIds: [orderId] },
      {
        onSuccess: () => {
          notifications.show({
            title: 'Order removed',
            message: 'Order has been removed from the batch',
            color: 'green',
          });
          setSelectedOrderIds((prev) => {
            const newSet = new Set(prev);
            newSet.delete(orderId);
            return newSet;
          });
        },
        onError: (error) => {
          notifications.show({
            title: 'Error',
            message:
              error instanceof Error
                ? error.message
                : 'Failed to remove order from batch',
            color: 'red',
          });
        },
      }
    );
  };

  const handleBulkRemove = () => {
    const orderIds = Array.from(selectedOrderIds);
    removeFromBatch.mutate(
      { batchId, orderIds },
      {
        onSuccess: () => {
          notifications.show({
            title: 'Orders removed',
            message: `${orderIds.length} orders have been removed from the batch`,
            color: 'green',
          });
          setSelectedOrderIds(new Set());
        },
        onError: (error) => {
          notifications.show({
            title: 'Error',
            message:
              error instanceof Error
                ? error.message
                : 'Failed to remove orders from batch',
            color: 'red',
          });
        },
      }
    );
  };

  const handleReprint = () => {
    // TODO: Implement reprint batch functionality
    notifications.show({
      title: 'Reprint initiated',
      message: 'Batch reprint has been initiated',
      color: 'blue',
    });
  };

  if (batchQuery.isLoading) {
    return (
      <div className={styles.container}>
        <Skeleton height={200} />
        <Skeleton height={400} />
      </div>
    );
  }

  if (!batch) {
    return (
      <div className={styles.container}>
        <Text c="dimmed">Batch not found</Text>
      </div>
    );
  }

  const createdByName = batch.creator
    ? `${batch.creator.firstName} ${batch.creator.lastName}`
    : 'Unknown';

  return (
    <>
      <Head title={`Batch: ${batch.name}`} description="Batch details" />
      <BatchStatusModal
        opened={statusModalOpened}
        onClose={closeStatusModal}
        batch={batch}
      />
      <BatchNameModal
        opened={nameModalOpened}
        onClose={closeNameModal}
        batch={batch}
      />

      <div className={styles.container}>
        {/* Top Section: Batch Info + Actions */}
        <div className={styles.topSection}>
          <Card withBorder className={styles.batchInfoCard}>
            <div className={styles.batchHeader}>
              <Text size="xl" fw={600}>
                Batch: {batch.name} (#{batch.id})
              </Text>
              <Anchor size="sm" c="primary" onClick={openNameModal}>
                Edit
              </Anchor>
            </div>
            <Text size="sm" c="dimmed">
              Created by {createdByName} {formatDateTime(batch.createdAt)}
            </Text>

            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statLabel}>
                  <Text size="sm" c="dimmed">
                    Status
                  </Text>
                  <Anchor size="xs" c="primary" onClick={openStatusModal}>
                    Edit
                  </Anchor>
                </div>
                <MappedBadge
                  value={batch.status}
                  colorMap={BATCH_STATUS_COLORS}
                />
              </div>

              <div className={styles.statCard}>
                <Text size="sm" c="dimmed" mb="xs">
                  Creation Date
                </Text>
                <Text size="lg" fw={500}>
                  {formatDate(batch.createdAt)}
                </Text>
              </div>

              <div className={styles.statCard}>
                <Text size="sm" c="dimmed" mb="xs">
                  Total Packs
                </Text>
                <Text size="lg" fw={500}>
                  {batch.totalPacks}
                </Text>
              </div>

              <div className={styles.statCard}>
                <Text size="sm" c="dimmed" mb="xs">
                  Total Cards
                </Text>
                <Text size="lg" fw={500}>
                  {batch.totalCards}
                </Text>
              </div>
            </div>
          </Card>

          <Card withBorder className={styles.actionsCard}>
            <Text size="sm" fw={600} mb="md" ta="center">
              Batch Actions
            </Text>
            <Stack gap="sm">
              <Button
                variant="filled"
                leftSection={<Printer size={16} />}
                onClick={handleReprint}
              >
                Reprint Batch
              </Button>
              <Button
                variant="outline"
                leftSection={<Plus size={16} />}
                component={Link}
                to="/admin/orders"
              >
                Add Orders
              </Button>
            </Stack>
          </Card>
        </div>

        {/* Orders Section */}
        <Card withBorder className={styles.ordersSection}>
          <div className={styles.ordersToolbar}>
            <div className={styles.ordersHeader}>
              <Text size="lg" fw={600}>
                Orders in this Batch
              </Text>
              <Text size="sm" c="dimmed">
                All orders included in batch:{' '}
                <Text span c="primary" fw={500}>
                  {batch.name}
                </Text>
              </Text>
            </div>
            <Menu shadow="md" width={200} position="bottom-end">
              <Menu.Target>
                <Button
                  variant="filled"
                  rightSection={<ChevronDown size={16} />}
                  disabled={selectedCount === 0}
                >
                  Bulk Actions
                </Button>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item
                  leftSection={<Trash2 size={14} />}
                  color="red"
                  onClick={handleBulkRemove}
                >
                  Remove from Batch
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </div>

          <Table horizontalSpacing="md" verticalSpacing="sm">
            <Table.Thead>
              <Table.Tr>
                <Table.Th w={50}>
                  <Checkbox
                    checked={allCurrentPageSelected}
                    indeterminate={selectedCount > 0 && !allCurrentPageSelected}
                    onChange={handleSelectAllToggle}
                    radius="xl"
                    aria-label="Select all orders"
                  />
                </Table.Th>
                <Table.Th w={80}>ID</Table.Th>
                <Table.Th w={180}>User</Table.Th>
                <Table.Th w={120}>Date</Table.Th>
                <Table.Th w={100}># of Packs</Table.Th>
                <Table.Th w={100}>Total</Table.Th>
                <Table.Th w={120}>Ship Status</Table.Th>
                <Table.Th w={120}>Tracking</Table.Th>
                <Table.Th w={80}>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {orders.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={9}>
                    <Text ta="center" c="dimmed" py="xl">
                      No orders in this batch
                    </Text>
                  </Table.Td>
                </Table.Tr>
              ) : (
                orders.map((order) => {
                  const isSelected = selectedOrderIds.has(order.id);
                  const cellClass = isSelected
                    ? styles.selectedCell
                    : undefined;
                  const customerName = `${order.user.firstName} ${order.user.lastName}`;
                  const packCount = order.lineItems.reduce(
                    (sum, item) => sum + item.quantity,
                    0
                  );

                  return (
                    <Table.Tr key={order.id}>
                      <Table.Td className={cellClass}>
                        <Checkbox
                          checked={isSelected}
                          onChange={() => toggleOrderSelection(order.id)}
                          radius="xl"
                        />
                      </Table.Td>
                      <Table.Td className={cellClass}>
                        <Text size="sm" c="primary" fw={500}>
                          {order.id}
                        </Text>
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
                        <Text size="sm">{packCount}</Text>
                      </Table.Td>
                      <Table.Td className={cellClass}>
                        <Text size="sm">
                          {formatCurrency(order.totalAmount)}
                        </Text>
                      </Table.Td>
                      <Table.Td className={cellClass}>
                        <MappedBadge
                          value={order.shipmentStatus}
                          colorMap={SHIPMENT_STATUS_COLORS}
                        />
                      </Table.Td>
                      <Table.Td className={cellClass}>
                        <Text size="sm" c="dimmed">
                          -
                        </Text>
                      </Table.Td>
                      <Table.Td className={cellClass}>
                        <Group gap="xs">
                          <Button
                            variant="subtle"
                            color="red"
                            size="compact-sm"
                            p={4}
                            onClick={() => handleRemoveOrder(order.id)}
                            loading={removeFromBatch.isPending}
                          >
                            <Trash2 size={16} />
                          </Button>
                          <Menu shadow="md" width={180} position="bottom-end">
                            <Menu.Target>
                              <Button variant="subtle" size="compact-sm" p={4}>
                                <MoreHorizontal size={16} />
                              </Button>
                            </Menu.Target>
                            <Menu.Dropdown>
                              <Menu.Item
                                leftSection={<Package size={14} />}
                                onClick={() => handleMoveToBatch(order.id)}
                              >
                                Move to Batch
                              </Menu.Item>
                            </Menu.Dropdown>
                          </Menu>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  );
                })
              )}
            </Table.Tbody>
          </Table>
        </Card>
      </div>
    </>
  );
}
