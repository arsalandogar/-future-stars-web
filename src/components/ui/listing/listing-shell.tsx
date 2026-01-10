import type { ReactNode } from 'react';
import { Card, Group, Tabs, TextInput } from '@mantine/core';
import { Search } from 'lucide-react';

import { useListingContext } from './use-listing-context';

export interface ListingTab {
  value: string;
  label: string;
}

export interface ListingShellProps {
  searchPlaceholder?: string;
  actions?: ReactNode;
  filters?: ReactNode;
  showSearch?: boolean;
  tabs?: ListingTab[];
  activeTab?: string;
  onTabChange?: (value: string | null) => void;
  children: ReactNode;
}

export function ListingShell({
  searchPlaceholder = 'Search...',
  actions,
  filters,
  showSearch = true,
  tabs,
  activeTab,
  onTabChange,
  children,
}: ListingShellProps) {
  const { search, setSearch } = useListingContext();

  return (
    <>
      {actions && (
        <Group justify="flex-end" mb="md">
          {actions}
        </Group>
      )}
      <Card withBorder radius="md" p="lg">
        <div className="flex flex-col gap-6">
          {tabs && tabs.length > 0 && (
            <Tabs value={activeTab} onChange={onTabChange}>
              <Tabs.List>
                {tabs.map((tab) => (
                  <Tabs.Tab key={tab.value} value={tab.value}>
                    {tab.label}
                  </Tabs.Tab>
                ))}
              </Tabs.List>
            </Tabs>
          )}

          {(showSearch || filters) && (
            <Group justify="space-between" align="flex-start">
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
              {filters}
            </Group>
          )}

          {children}
        </div>
      </Card>
    </>
  );
}
