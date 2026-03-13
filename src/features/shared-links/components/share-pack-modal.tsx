import { useState } from 'react';
import {
  ActionIcon,
  Button,
  Drawer,
  Modal,
  Textarea,
  useMantineTheme,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  Link2,
  X,
} from 'lucide-react';

import { CardSidePreview } from '@/components/card-side-preview';
import type { Pack } from '@/types';

import { useCreateSharedLink } from '../api/create-shared-link';

import styles from './share-pack-modal.module.css';

interface SharePackModalProps {
  pack: Pack;
  opened: boolean;
  onClose: () => void;
}

export function SharePackModal({ pack, opened, onClose }: SharePackModalProps) {
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);
  const [message, setMessage] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const createSharedLink = useCreateSharedLink();

  const [prevOpened, setPrevOpened] = useState(opened);
  if (opened !== prevOpened) {
    setPrevOpened(opened);
    if (opened) {
      setMessage('');
      setLinkCopied(false);
      setCurrentCardIndex(0);
    }
  }

  const packCards = pack.packCards;
  const totalCards = packCards.length;
  const currentPackCard = packCards[currentCardIndex];
  const canGoPrev = currentCardIndex > 0;
  const canGoNext = currentCardIndex < totalCards - 1;

  const handleCopyLink = async () => {
    let code = pack.sharedLink?.code;

    if (!code) {
      try {
        const result = await createSharedLink.mutateAsync({
          shareableType: 'pack',
          packId: pack.id,
          message: message || undefined,
        });
        code = result.code;
      } catch {
        notifications.show({
          title: 'Error',
          message: 'Failed to create share link. Please try again.',
          color: 'red',
        });
        return;
      }
    } else if (message) {
      createSharedLink.mutate({
        shareableType: 'pack',
        packId: pack.id,
        message,
      });
    }

    const url = `${window.location.origin}/shared/${code}`;
    void navigator.clipboard.writeText(url);
    setLinkCopied(true);
  };

  const body = (
    <div className={styles.shell}>
      <div className={styles.header}>
        <h2 className={styles.title}>Share Pack</h2>
        <ActionIcon
          variant="transparent"
          size={38}
          onClick={onClose}
          aria-label="Close share pack modal"
          className={styles.closeButton}
        >
          <X size={24} />
        </ActionIcon>
      </div>

      <div className={styles.contentArea}>
        <div className={styles.previewWrap}>
          <div className={styles.previewRow}>
            <button
              type="button"
              className={styles.arrowButton}
              onClick={() => canGoPrev && setCurrentCardIndex((i) => i - 1)}
              disabled={!canGoPrev}
              aria-label="Previous card"
            >
              <ChevronLeft size={24} />
            </button>

            {currentPackCard && (
              <div className={styles.cardsRow}>
                <div className={styles.cardImageWrapper}>
                  <CardSidePreview
                    card={currentPackCard.card}
                    className={styles.cardImage}
                  />
                </div>
                <div className={styles.cardImageWrapper}>
                  <CardSidePreview
                    card={currentPackCard.card}
                    side="back"
                    className={styles.cardImage}
                  />
                </div>
              </div>
            )}

            <button
              type="button"
              className={styles.arrowButton}
              onClick={() => canGoNext && setCurrentCardIndex((i) => i + 1)}
              disabled={!canGoNext}
              aria-label="Next card"
            >
              <ChevronRight size={24} />
            </button>
          </div>

          <div className={styles.counterPill}>
            Card {currentCardIndex + 1} of {totalCards}
          </div>
        </div>

        <div className={styles.details}>
          <p className={styles.description}>
            Invite friends or teammates to view this pack and add it to their
            collection!
          </p>

          <div>
            <p className={styles.messageLabel}>
              Add custom message{' '}
              <span className={styles.messageOptional}>(optional)</span>
            </p>
            <Textarea
              placeholder="Write a message..."
              value={message}
              onChange={(e) => setMessage(e.currentTarget.value)}
              maxLength={500}
              minRows={3}
              autosize
              classNames={{ input: styles.textarea }}
            />
            <p className={styles.helper}>
              *Visible to the recipients on the pack invitation
            </p>
          </div>
        </div>
      </div>

      <div className={styles.footer}>
        <button type="button" className={styles.cancelButton} onClick={onClose}>
          <ArrowLeft size={18} />
          <span>Cancel</span>
        </button>

        <Button
          variant="filled"
          className={styles.ctaButton}
          leftSection={linkCopied ? <Check size={20} /> : <Link2 size={20} />}
          onClick={() => void handleCopyLink()}
          loading={createSharedLink.isPending}
          onMouseEnter={() => setLinkCopied(false)}
        >
          {linkCopied ? 'Link Copied' : 'Copy Link'}
        </Button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer
        opened={opened}
        onClose={onClose}
        position="bottom"
        size="90%"
        withCloseButton={false}
        classNames={{ content: styles.drawer }}
      >
        {body}
      </Drawer>
    );
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      withCloseButton={false}
      centered
      size="771px"
      classNames={{
        overlay: styles.overlay,
        content: styles.content,
        body: styles.body,
      }}
    >
      {body}
    </Modal>
  );
}
