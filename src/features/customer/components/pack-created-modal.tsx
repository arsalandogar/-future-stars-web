import { ActionIcon, Button, Text, TextInput, Title } from '@mantine/core';
import { useNavigate } from '@tanstack/react-router';
import { RefreshCcw, X } from 'lucide-react';
import { MdOutlineShoppingCart } from 'react-icons/md';
import { useEffect, useRef, useState } from 'react';

import { MAX_PACK_CARDS, type Pack } from '@/types';

import { useAddCartItem } from '../api/add-cart-item';
import { useUpdatePack } from '../api/update-pack';
import { useCreatePackModalStore } from '../stores/create-pack-modal-store';
import { usePackAutofillModalStore } from '../stores/pack-autofill-modal-store';
import { formatDate } from '../utils/format-date';
import { getTotalCards } from '../utils/get-total-cards';

import styles from './pack-created-modal.module.css';

interface PackCreatedModalProps {
  pack: Pack | null;
  opened: boolean;
  onClose: () => void;
}

export function PackCreatedModal({
  pack,
  opened,
  onClose,
}: PackCreatedModalProps) {
  const navigate = useNavigate();
  const closeCreatePackModal = useCreatePackModalStore((s) => s.close);
  const openAutofillModal = usePackAutofillModalStore((s) => s.open);
  const addCartItem = useAddCartItem();
  const updatePack = useUpdatePack();
  const [isExiting, setIsExiting] = useState(false);
  const [originalName, setOriginalName] = useState(pack?.name ?? '');
  const [packName, setPackName] = useState(pack?.name ?? '');
  const inputRef = useRef<HTMLInputElement>(null);
  const exitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (exitTimeoutRef.current) {
        clearTimeout(exitTimeoutRef.current);
      }
    };
  }, []);

  // Track previous pack for "adjust state during render" pattern
  const [prevPack, setPrevPack] = useState(pack);

  // Focus and select input when modal opens
  useEffect(() => {
    if (opened && pack) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [opened, pack]);

  // Reset state when modal opens with new pack - adjust state during render
  if (pack !== prevPack) {
    setPrevPack(pack);
    if (pack) {
      setOriginalName(pack.name);
      setPackName(pack.name);
    }
  }

  if (!opened || !pack) return null;

  const handleResetName = () => {
    setPackName(originalName);
  };

  const handleOverlayClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget && !isExiting) {
      onClose();
    }
  };

  const handleBuy = () => {
    const totalCards = getTotalCards(pack.packCards);
    const trimmedName = packName.trim();
    const nameHasChanged = trimmedName && trimmedName !== originalName;

    const proceedToCart = () => {
      addCartItem.mutate(
        { packId: pack.id, quantity: 1 },
        {
          onSuccess: () => {
            if (totalCards < MAX_PACK_CARDS) {
              // Pack is not full - show autofill modal
              onClose();
              openAutofillModal(pack);
            } else {
              // Pack is full - navigate to cart
              setIsExiting(true);
              exitTimeoutRef.current = setTimeout(() => {
                onClose();
                closeCreatePackModal();
                void navigate({ to: '/cart' });
                setIsExiting(false);
              }, 400);
            }
          },
        }
      );
    };

    // If name changed, update it first, then add to cart
    if (nameHasChanged) {
      updatePack.mutate(
        { id: pack.id, name: trimmedName },
        {
          onSuccess: () => {
            setOriginalName(trimmedName);
            proceedToCart();
          },
        }
      );
    } else {
      proceedToCart();
    }
  };

  const firstCard = pack.packCards[0]?.card;

  return (
    <div
      className={`${styles.overlay} ${isExiting ? styles.overlayExiting : ''}`}
      onClick={handleOverlayClick}
    >
      <div
        className={`${styles.container} ${isExiting ? styles.containerExiting : ''}`}
      >
        {/* Close Button - Top Right */}
        <button
          type="button"
          className={styles.closeButton}
          onClick={onClose}
          disabled={isExiting}
        >
          <X size={24} />
        </button>

        {/* Success Icon */}
        <div className={styles.successIconWrapper}>
          <div className={styles.successIconCircle}>
            <svg
              className={styles.checkmark}
              viewBox="0 0 52 52"
              width="52"
              height="52"
            >
              <circle
                className={styles.checkmarkCircle}
                cx="26"
                cy="26"
                r="24"
                fill="none"
                strokeWidth="3"
              />
              <path
                className={styles.checkmarkCheck}
                fill="none"
                strokeWidth="4"
                d="M14 27l8 8 16-16"
              />
            </svg>
          </div>
        </div>

        {/* Header */}
        <div className={styles.header}>
          <Title order={3} c="white" ta="center" m={0}>
            Pack Created!
          </Title>
        </div>

        {/* Pack Preview with Editable Name */}
        <div className={styles.content}>
          <div className={styles.packPreview}>
            <div className={styles.thumbnail}>
              {firstCard && (
                <img
                  src={firstCard.frontCardImage}
                  alt={pack.name}
                  className={styles.thumbnailImage}
                />
              )}
            </div>
            <div className={styles.packInfo}>
              <div className={styles.nameRow}>
                <TextInput
                  ref={inputRef}
                  value={packName}
                  onChange={(e) => setPackName(e.currentTarget.value)}
                  size="sm"
                  className={styles.editNameInput}
                  classNames={{ input: styles.editNameInputInner }}
                />
                {packName !== originalName && (
                  <ActionIcon
                    variant="transparent"
                    size="sm"
                    onClick={handleResetName}
                    className={styles.resetButton}
                    aria-label="Reset to original name"
                  >
                    <RefreshCcw size={16} />
                  </ActionIcon>
                )}
              </div>
              <div className={styles.dateRow}>
                <span className={styles.statusDot} />
                <Text size="sm" c="dimmed">
                  Created: {formatDate(pack.createdAt)}
                </Text>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <Button
            variant="filled"
            size="lg"
            radius="xl"
            leftSection={<MdOutlineShoppingCart size={20} />}
            onClick={handleBuy}
            loading={addCartItem.isPending || updatePack.isPending}
            disabled={isExiting || !packName.trim()}
            fullWidth
            className={styles.buyButton}
          >
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  );
}
