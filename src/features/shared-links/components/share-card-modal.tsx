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
import { ArrowLeft, Check, Copy, Link2, X } from 'lucide-react';

import { CardSidePreview } from '@/components/card-side-preview';
import type { Card } from '@/types';

import { useCreateSharedLink } from '../api/create-shared-link';

import styles from './share-card-modal.module.css';

type ShareMode = 'link' | 'image';

interface ShareCardModalProps {
  card: Card;
  opened: boolean;
  onClose: () => void;
}

export function ShareCardModal({ card, opened, onClose }: ShareCardModalProps) {
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);
  const [shareMode, setShareMode] = useState<ShareMode>('link');
  const [message, setMessage] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);
  const [imageCopied, setImageCopied] = useState(false);
  const createSharedLink = useCreateSharedLink();

  const [prevOpened, setPrevOpened] = useState(opened);
  if (opened !== prevOpened) {
    setPrevOpened(opened);
    if (opened) {
      setShareMode('link');
      setMessage('');
      setLinkCopied(false);
      setImageCopied(false);
    }
  }

  const handleCopyLink = async () => {
    let code = card.sharedLink?.code;

    if (!code) {
      try {
        const result = await createSharedLink.mutateAsync({
          shareableType: 'card',
          cardId: card.id,
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
        shareableType: 'card',
        cardId: card.id,
        message,
      });
    }

    const url = `${window.location.origin}/shared/${code}`;
    void navigator.clipboard.writeText(url);
    setLinkCopied(true);
  };

  const handleCopyImage = async () => {
    if (!card.frontCardImage) return;
    try {
      const response = await fetch(card.frontCardImage);
      const blob = await response.blob();
      if (!window.ClipboardItem || !navigator.clipboard?.write) {
        throw new Error(
          'Clipboard image copy is not supported on this browser'
        );
      }
      await navigator.clipboard.write([
        new window.ClipboardItem({ [blob.type]: blob }),
      ]);
      setImageCopied(true);
    } catch {
      notifications.show({
        title: 'Error',
        message: 'Failed to copy image. Please try again.',
        color: 'red',
      });
    }
  };

  const body = (
    <div className={styles.shell}>
      <div className={styles.header}>
        <h2 className={styles.title}>Share Card</h2>
        <ActionIcon
          variant="transparent"
          size={38}
          onClick={onClose}
          aria-label="Close share card modal"
          className={styles.closeButton}
        >
          <X size={24} />
        </ActionIcon>
      </div>

      <div className={styles.contentArea}>
        <div className={styles.cardsRow}>
          <div className={styles.cardImageWrapper}>
            <CardSidePreview card={card} className={styles.cardImage} />
          </div>
          <div className={styles.cardImageWrapper}>
            <CardSidePreview
              card={card}
              side="back"
              className={styles.cardImage}
            />
          </div>
        </div>

        <div className={styles.shareModes}>
          <div
            className={styles.modeRow}
            onClick={() => setShareMode('link')}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                setShareMode('link');
              }
            }}
            aria-pressed={shareMode === 'link'}
          >
            <span
              className={styles.modeBullet}
              data-selected={shareMode === 'link'}
            >
              {shareMode === 'link' && (
                <Check
                  size={14}
                  strokeWidth={3.25}
                  className={styles.modeCheck}
                />
              )}
            </span>
            <span
              className={styles.modeText}
              data-selected={shareMode === 'link'}
            >
              Invite friends or teammates to collect and buy this card!
            </span>
          </div>

          <div className={styles.modeDetails}>
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
              disabled={shareMode === 'image'}
              classNames={{ input: styles.textarea }}
            />
            <p className={styles.helper}>
              *Visible to the recipients on the card invitation
            </p>
          </div>

          <div
            className={styles.modeRow}
            onClick={() => setShareMode('image')}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                setShareMode('link');
              }
            }}
            aria-pressed={shareMode === 'image'}
          >
            <span
              className={styles.modeBullet}
              data-selected={shareMode === 'image'}
            >
              {shareMode === 'image' && (
                <Check
                  size={14}
                  strokeWidth={3.25}
                  className={styles.modeCheck}
                />
              )}
            </span>
            <span
              className={styles.modeText}
              data-selected={shareMode === 'image'}
            >
              Share image (only)
            </span>
          </div>
        </div>
      </div>

      <div className={styles.footer}>
        <button type="button" className={styles.cancelButton} onClick={onClose}>
          <ArrowLeft size={18} />
          <span>Cancel</span>
        </button>

        {shareMode === 'link' ? (
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
        ) : (
          <Button
            variant="filled"
            className={styles.ctaButton}
            leftSection={imageCopied ? <Check size={20} /> : <Copy size={20} />}
            onClick={() => void handleCopyImage()}
            disabled={imageCopied}
          >
            {imageCopied ? 'Image Copied' : 'Copy Image'}
          </Button>
        )}
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
