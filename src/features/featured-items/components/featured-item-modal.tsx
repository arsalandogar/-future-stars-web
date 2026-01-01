import { Modal } from '@mantine/core';
import type { FeaturedItem } from '../types';
import { FeaturedItemForm } from './featured-item-form';

type FeaturedItemModalProps = {
  item: FeaturedItem | undefined;
  opened: boolean;
  onClose: () => void;
};

export function FeaturedItemModal({
  item,
  opened,
  onClose,
}: FeaturedItemModalProps) {
  const modalTitle = item?.id ? (
    <h2 className="font-bold">Edit Featured Item</h2>
  ) : (
    <h2 className="font-bold">Create Featured Item</h2>
  );

  return (
    <>
      <Modal opened={opened} onClose={onClose} title={modalTitle} size={'lg'}>
        <FeaturedItemForm item={item} modalClose={onClose} />
      </Modal>
    </>
  );
}
