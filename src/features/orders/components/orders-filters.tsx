import { getRouteApi, useNavigate } from '@tanstack/react-router';

import {
  FilterSelect,
  ListingFilters,
  type ActiveFilter,
} from '@/components/ui/listing';

import type { OrderStatus } from '../types';

const routeApi = getRouteApi('/_authenticated/admin/_listing/orders');

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: 'created', label: 'Created' },
  { value: 'payment_failed', label: 'Payment Failed' },
  { value: 'paid', label: 'Paid' },
  { value: 'processing', label: 'Processing' },
  { value: 'sent_to_production', label: 'Sent to Production' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'refunded', label: 'Refunded' },
];

export function OrdersFilters() {
  const { status } = routeApi.useSearch();
  const navigate = useNavigate();

  const updateFilter = (key: string, value: unknown) => {
    void navigate({
      to: '.',
      search: (prev) => ({
        ...prev,
        [key]: value || undefined,
        page: 1,
      }),
    });
  };

  const removeFilter = (key: string) => {
    void navigate({
      to: '.',
      search: (prev) => ({
        ...prev,
        [key]: undefined,
        page: 1,
      }),
    });
  };

  const clearAllFilters = () => {
    void navigate({
      to: '.',
      search: { page: 1 },
    });
  };

  const activeFilters: ActiveFilter[] = [];

  if (status) {
    const statusOption = STATUS_OPTIONS.find((o) => o.value === status);
    activeFilters.push({
      key: 'status',
      label: 'Status',
      displayValue: statusOption?.label ?? status,
    });
  }

  return (
    <ListingFilters
      activeFilters={activeFilters}
      onRemoveFilter={removeFilter}
      onClearAll={clearAllFilters}
    >
      <FilterSelect
        label="Status"
        options={STATUS_OPTIONS}
        value={status}
        onChange={(v) => updateFilter('status', v)}
      />
    </ListingFilters>
  );
}
