import { useShareModalStore } from '@/stores/share-modal-store';

import { ShareCardModal } from './share-card-modal';
import { SharePackModal } from './share-pack-modal';

export function GlobalShareModal() {
  const { opened, target, close } = useShareModalStore();

  if (!target) return null;

  if (target.type === 'card') {
    return (
      <ShareCardModal card={target.card} opened={opened} onClose={close} />
    );
  }

  return <SharePackModal pack={target.pack} opened={opened} onClose={close} />;
}
