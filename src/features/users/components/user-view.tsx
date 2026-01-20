import { ListingShell, type ListingTab } from '@/components/ui/listing';
import { formatDate } from '@/utils/date';
import { Card, Stack, Title, Text, SimpleGrid } from '@mantine/core';

import type { UserWithRelations } from '../types';
import { AddressesList } from './addresses-list';
import { UserCardsList } from './user-cards-list';
import { CartItemsList } from './cart-items-list';
import { UserOrdersList } from './user-orders-list';
import { UserPacksList } from './user-packs-list';
import { getRouteApi, useNavigate } from '@tanstack/react-router';

const routeApi = getRouteApi('/_authenticated/admin/_listing/users/$id/');

interface UserViewProps {
  user: UserWithRelations;
}

export type TabValue = 'orders' | 'cards' | 'packs' | 'cartItems' | 'addresses';

const TABS: ListingTab[] = [
  { value: 'orders', label: 'Orders' },
  { value: 'cards', label: 'Cards' },
  { value: 'packs', label: 'Packs' },
  { value: 'cartItems', label: 'Cart Items' },
  { value: 'addresses', label: 'Addresses' },
];

export function UserView({ user }: UserViewProps) {
  const navigate = useNavigate();
  const { tab: activeTab } = routeApi.useSearch();

  const handleTabChange = (value: string | null) => {
    if (value) {
      void navigate({
        to: '.',
        search: (prev) => ({ ...prev, tab: value as TabValue }),
      });
    }
  };

  const renderTable = () => {
    switch (activeTab) {
      case 'orders':
        return <UserOrdersList userId={user.id} />;
      case 'cards':
        return <UserCardsList userId={user.id} />;
      case 'packs':
        return <UserPacksList userId={user.id} />;
      case 'cartItems':
        return <CartItemsList userId={user.id} />;
      case 'addresses':
        return <AddressesList userId={user.id} />;
      default:
        return null;
    }
  };

  return (
    <Stack gap="xl">
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
        <Card withBorder radius="md" p="lg">
          <div>
            <Title order={3}>{user.fullName}</Title>
            <Text size="sm" c="dimmed" pt="xs">
              Role: {user.role}
            </Text>
            <Text size="sm" c="dimmed">
              Email: {user.email ?? 'none'}
            </Text>
            <Text size="sm" c="dimmed">
              Phone: {user.phone ?? 'none'}
            </Text>
            <Text size="sm" c="dimmed">
              Joined: {formatDate(user.createdAt)}
            </Text>
          </div>
        </Card>

        <SimpleGrid cols={2} spacing="md">
          <StatCard label="Total Orders" value={user.ordersCount ?? 0} />
          <StatCard label="Cards" value={user.cardsCount ?? 0} />
          <StatCard label="Cart Items" value={user.cartItemsCount ?? 0} />
          <StatCard label="Packs" value={user.packsCount ?? 0} />
        </SimpleGrid>
      </SimpleGrid>

      <ListingShell
        searchPlaceholder="Search..."
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        showFilter={false}
      >
        {renderTable()}
      </ListingShell>
    </Stack>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card withBorder radius="md" p="md">
      <Text size="xs" c="dimmed">
        {label}
      </Text>
      <Text fw={600} size="xl">
        {value}
      </Text>
    </Card>
  );
}
