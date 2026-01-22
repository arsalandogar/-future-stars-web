import { useCreatePackModalStore } from '../stores/create-pack-modal-store';
import { CreatePackModal } from './create-pack-modal';

export function GlobalCreatePackModal() {
  const { opened, editingPack, initialSelectedCards, close } =
    useCreatePackModalStore();

  return (
    <CreatePackModal
      opened={opened}
      onClose={close}
      editingPack={editingPack}
      initialSelectedCards={initialSelectedCards}
    />
  );
}
