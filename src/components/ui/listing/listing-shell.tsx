import type { ReactNode } from 'react';
import { Button, Card, Group, Text, TextInput, Title } from '@mantine/core';
import { Search, SlidersHorizontal } from 'lucide-react';

import { useListingContext } from './use-listing-context';

export interface ListingShellProps {
  title: string;
  description: string;
  searchPlaceholder?: string;
  actions?: ReactNode;
  showSearch?: boolean;
  showFilter?: boolean;
  onFilterClick?: () => void;
  children: ReactNode;
}

export function ListingShell({
  title,
  description,
  searchPlaceholder = 'Search...',
  actions,
  showSearch = true,
  showFilter = true,
  onFilterClick,
  children,
}: ListingShellProps) {
  const { search, setSearch } = useListingContext();

  return (
    <Card withBorder radius="md" p="lg">
      <div className="flex flex-col gap-6">
        <Group justify="space-between" align="flex-start">
          <div>
            <Title order={4}>{title}</Title>
            <Text size="sm" c="dimmed">
              {description}
            </Text>
          </div>
          {actions}
        </Group>

        {(showSearch || showFilter) && (
          <Group justify="space-between">
            {showSearch ? (
              <TextInput
                placeholder={searchPlaceholder}
                leftSection={<Search size={16} />}
                defaultValue={search}
                onChange={(e) => setSearch(e.currentTarget.value)}
                className="w-80"
              />
            ) : (
              <div />
            )}
            {showFilter && (
              <Button
                variant="default"
                leftSection={<SlidersHorizontal size={16} />}
                onClick={onFilterClick}
                disabled={!onFilterClick}
              >
                Filter
              </Button>
            )}
          </Group>
        )}

        {children}
      </div>
    </Card>
  );
}
