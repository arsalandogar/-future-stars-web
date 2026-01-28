import { ActionIcon, Button, Text, TextInput, Title } from '@mantine/core';
import { useNavigate } from '@tanstack/react-router';
import { Check, Pencil, ShoppingCart, X } from 'lucide-react';
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
  const [isEditing, setIsEditing] = useState(true);
  const [displayName, setDisplayName] = useState(pack?.name ?? '');
  const [editingName, setEditingName] = useState(pack?.name ?? '');
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

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  // Reset state when modal opens with new pack - adjust state during render
  if (pack !== prevPack) {
    setPrevPack(pack);
    if (pack) {
      setDisplayName(pack.name);
      setEditingName(pack.name);
      setIsEditing(true);
    }
  }

  if (!opened || !pack) return null;

  const handleStartEditing = () => {
    setEditingName(displayName);
    setIsEditing(true);
  };

  const handleCancelEditing = () => {
    setEditingName(displayName);
    setIsEditing(false);
  };

  const handleSaveEditing = () => {
    const trimmedName = editingName.trim();
    if (!trimmedName || trimmedName === displayName) {
      handleCancelEditing();
      return;
    }

    updatePack.mutate(
      { id: pack.id, name: trimmedName },
      {
        onSuccess: () => {
          setDisplayName(trimmedName);
          setIsEditing(false);
        },
      }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveEditing();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancelEditing();
    }
  };

  const handleOverlayClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget && !isExiting) {
      onClose();
    }
  };

  const handleBuy = () => {
    const totalCards = getTotalCards(pack.packCards);

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
                {isEditing ? (
                  <>
                    <TextInput
                      ref={inputRef}
                      value={editingName}
                      onChange={(e) => setEditingName(e.currentTarget.value)}
                      onKeyDown={handleKeyDown}
                      size="sm"
                      className={styles.editNameInput}
                      classNames={{ input: styles.editNameInputInner }}
                    />
                    <div className={styles.editActions}>
                      <ActionIcon
                        variant="filled"
                        color="green"
                        size="sm"
                        onClick={handleSaveEditing}
                        loading={updatePack.isPending}
                      >
                        <Check size={16} color="white" />
                      </ActionIcon>
                      <ActionIcon
                        variant="filled"
                        color="red"
                        size="sm"
                        onClick={handleCancelEditing}
                        disabled={updatePack.isPending}
                      >
                        <X size={16} color="white" />
                      </ActionIcon>
                    </div>
                  </>
                ) : (
                  <>
                    <Text
                      fw={600}
                      size="lg"
                      c="white"
                      className={styles.packName}
                    >
                      {displayName}
                    </Text>
                    <ActionIcon
                      variant="transparent"
                      size="sm"
                      onClick={handleStartEditing}
                      className={styles.editButton}
                    >
                      <Pencil size={16} />
                    </ActionIcon>
                  </>
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
            leftSection={<ShoppingCart size={20} />}
            onClick={handleBuy}
            loading={addCartItem.isPending}
            disabled={isExiting}
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
