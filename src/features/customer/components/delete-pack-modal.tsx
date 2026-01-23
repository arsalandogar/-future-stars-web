import { Trash2 } from 'lucide-react';

import type { Pack } from '@/types';

import { ConfirmationModal } from '@/components/ui/confirmation-modal';

import { useDeletePack } from '../api/delete-pack';

interface DeletePackModalProps {
  pack: Pack | null;
  opened: boolean;
  onClose: () => void;
}

export function DeletePackModal({
  pack,
  opened,
  onClose,
}: DeletePackModalProps) {
  const deletePack = useDeletePack();

  const handleConfirm = () => {
    if (!pack) return;

    deletePack.mutate(pack.id, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  return (
    <ConfirmationModal
      opened={opened}
      onClose={onClose}
      title="DELETE PACK"
      message={`Are you sure you want to delete the pack "${pack?.name}"?`}
      subtitle="This action cannot be undone."
      confirmLabel="Delete"
      confirmIcon={<Trash2 size={18} />}
      onConfirm={handleConfirm}
      isPending={deletePack.isPending}
    />
  );
}
