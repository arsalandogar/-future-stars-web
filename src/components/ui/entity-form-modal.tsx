import type { ReactNode } from 'react';
import { Modal, type MantineSize } from '@mantine/core';

interface EntityFormModalProps<T extends { id: number }> {
  item: T | undefined;
  opened: boolean;
  onClose: () => void;
  entityName: string;
  size?: MantineSize;
  children: (props: {
    item: T | undefined;
    modalClose: () => void;
  }) => ReactNode;
}

export function EntityFormModal<T extends { id: number }>({
  item,
  opened,
  onClose,
  entityName,
  size,
  children,
}: EntityFormModalProps<T>) {
  const modalTitle = (
    <h2 className="font-bold">
      {item?.id ? 'Edit' : 'Create'} {entityName}
    </h2>
  );

  const formKey = opened ? `form-${item?.id ?? 'new'}` : 'closed';

  return (
    <Modal opened={opened} onClose={onClose} title={modalTitle} size={size}>
      <div key={formKey}>{children({ item, modalClose: onClose })}</div>
    </Modal>
  );
}
