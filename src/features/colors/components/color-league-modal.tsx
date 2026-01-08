import { Modal } from '@mantine/core';

import type { ColorLeague } from '../types';
import { ColorLeagueForm } from './color-league-form';

type ColorLeagueModalProps = {
  item: ColorLeague | undefined;
  opened: boolean;
  onClose: () => void;
};

export function ColorLeagueModal({
  item,
  opened,
  onClose,
}: ColorLeagueModalProps) {
  const modalTitle = item?.id ? (
    <h2 className="font-bold">Edit Color League</h2>
  ) : (
    <h2 className="font-bold">Create Color League</h2>
  );

  // Key changes when modal opens or item changes, resetting form state
  const formKey = opened ? `form-${item?.id ?? 'new'}` : 'closed';

  return (
    <Modal opened={opened} onClose={onClose} title={modalTitle}>
      <ColorLeagueForm key={formKey} item={item} modalClose={onClose} />
    </Modal>
  );
}
