import { Button, Menu } from '@mantine/core';
import { ChevronDown, Package } from 'lucide-react';

interface BulkActionsMenuProps {
  selectedCount: number;
  onAddToBatch: () => void;
  disabled?: boolean;
}

export function BulkActionsMenu({
  selectedCount,
  onAddToBatch,
  disabled = false,
}: BulkActionsMenuProps) {
  return (
    <Menu shadow="md" width={200} position="bottom-end">
      <Menu.Target>
        <Button
          variant="filled"
          rightSection={<ChevronDown size={16} />}
          disabled={disabled || selectedCount === 0}
        >
          Bulk Actions
        </Button>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item leftSection={<Package size={14} />} onClick={onAddToBatch}>
          Add to Batch
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
