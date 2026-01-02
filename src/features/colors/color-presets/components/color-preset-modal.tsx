import { Modal } from '@mantine/core';

import type { ColorPreset } from '../types';
import { ColorPresetForm } from './color-preset-form';

type ColorPresetModalProps = {
  item: ColorPreset | undefined;
  opened: boolean;
  onClose: () => void;
};

export function ColorPresetModal({
  item,
  opened,
  onClose,
}: ColorPresetModalProps) {
  const modalTitle = item?.id ? (
    <h2 className="font-bold">Edit Color Preset</h2>
  ) : (
    <h2 className="font-bold">Create Color Preset</h2>
  );

  // Key changes when modal opens or item changes, resetting form state
  const formKey = opened ? `form-${item?.id ?? 'new'}` : 'closed';

  return (
    <Modal opened={opened} onClose={onClose} title={modalTitle} size="md">
      <ColorPresetForm key={formKey} item={item} modalClose={onClose} />
    </Modal>
  );
}
