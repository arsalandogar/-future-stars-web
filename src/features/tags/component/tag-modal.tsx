import { Modal } from '@mantine/core';
import type { Tag } from '../types';
import { TagForm } from './tag-form';

type TagModalProps = {
  tag: Tag | undefined;
  opened: boolean;
  onClose: () => void;
};

export function TagModal({ tag, opened, onClose }: TagModalProps) {
  const modalTitle = tag?.id ? (
    <h2 className=" font-bold">Edit Tag</h2>
  ) : (
    <h2 className=" font-bold">Create Tag</h2>
  );

  return (
    <>
      <Modal opened={opened} onClose={onClose} title={modalTitle} centered>
        <TagForm tag={tag} modalClose={onClose} />
      </Modal>
    </>
  );
}
