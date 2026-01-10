import type { ReactNode } from 'react';
import {
  Badge,
  Button,
  Drawer,
  Group,
  Stack,
  useMantineTheme,
} from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { SlidersHorizontal } from 'lucide-react';

import { ActiveFilterChips, type ActiveFilter } from './active-filter-chips';

export interface ListingFiltersProps {
  children: ReactNode;
  activeFilters?: ActiveFilter[];
  onRemoveFilter?: (key: string) => void;
  onClearAll?: () => void;
  layout?: 'inline' | 'drawer' | 'auto';
}

export function ListingFilters({
  children,
  activeFilters = [],
  onRemoveFilter,
  onClearAll,
  layout = 'auto',
}: ListingFiltersProps) {
  const theme = useMantineTheme();
  const [drawerOpened, { open, close }] = useDisclosure(false);
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);

  const shouldUseDrawer =
    layout === 'drawer' || (layout === 'auto' && isMobile);

  const handleRemoveFilter = (key: string) => {
    onRemoveFilter?.(key);
  };

  const handleClearAll = () => {
    onClearAll?.();
    close();
  };

  if (shouldUseDrawer) {
    return (
      <div className="space-y-3">
        <Group gap="sm">
          <Button
            variant="default"
            leftSection={<SlidersHorizontal size={16} />}
            onClick={open}
            rightSection={
              activeFilters.length > 0 ? (
                <Badge size="xs" circle>
                  {activeFilters.length}
                </Badge>
              ) : undefined
            }
          >
            Filters
          </Button>
        </Group>

        <Drawer
          opened={drawerOpened}
          onClose={close}
          title="Filters"
          position={isMobile ? 'bottom' : 'right'}
          size={isMobile ? '85%' : 'md'}
        >
          <Stack gap="md">
            {children}
            {activeFilters.length > 0 && onClearAll && (
              <Button variant="subtle" onClick={handleClearAll} fullWidth>
                Clear all filters
              </Button>
            )}
          </Stack>
        </Drawer>

        {activeFilters.length > 0 && onRemoveFilter && onClearAll && (
          <ActiveFilterChips
            filters={activeFilters}
            onRemove={handleRemoveFilter}
            onClearAll={handleClearAll}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Group gap="sm">{children}</Group>
      {activeFilters.length > 0 && onRemoveFilter && onClearAll && (
        <ActiveFilterChips
          filters={activeFilters}
          onRemove={handleRemoveFilter}
          onClearAll={handleClearAll}
        />
      )}
    </div>
  );
}
