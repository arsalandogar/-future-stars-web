import { getRouteApi, useNavigate } from '@tanstack/react-router';

import {
  FilterSelect,
  ListingFilters,
  type ActiveFilter,
} from '@/components/ui/listing';

import { ORDER_STATUS_OPTIONS } from '../constants';
import type { OrderStatus } from '../types';

const routeApi = getRouteApi('/_authenticated/admin/_listing/orders');

export function OrdersFilters() {
  const { status } = routeApi.useSearch();
  const navigate = useNavigate();

  const updateStatus = (value: OrderStatus | null) => {
    void navigate({
      to: '.',
      search: (prev) => ({
        ...prev,
        status: value ?? undefined,
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
    const statusOption = ORDER_STATUS_OPTIONS.find((o) => o.value === status);
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
        options={ORDER_STATUS_OPTIONS}
        value={status}
        onChange={(v) => updateStatus(v as OrderStatus | null)}
      />
    </ListingFilters>
  );
}
