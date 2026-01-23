import { Button, Text, Title } from '@mantine/core';
import { useNavigate } from '@tanstack/react-router';
import { ShoppingCart, X } from 'lucide-react';
import { useState } from 'react';

import type { Pack } from '@/types';

import { useAddCartItem } from '../api/add-cart-item';
import { useCreatePackModalStore } from '../stores/create-pack-modal-store';

import { PackItem } from './pack-item';
import styles from './pack-created-modal.module.css';

interface PackCreatedModalProps {
  pack: Pack | null;
  opened: boolean;
  onClose: () => void;
}

export function PackCreatedModal({ pack, opened, onClose }: PackCreatedModalProps) {
  const navigate = useNavigate();
  const closeCreatePackModal = useCreatePackModalStore((s) => s.close);
  const addCartItem = useAddCartItem();
  const [isExiting, setIsExiting] = useState(false);

  if (!opened || !pack) return null;

  const handleOverlayClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget && !isExiting) {
      onClose();
    }
  };

  const handleBuy = () => {
    addCartItem.mutate(
      { packId: pack.id, quantity: 1 },
      {
        onSuccess: () => {
          setIsExiting(true);
          // Wait for exit animation before navigating
          setTimeout(() => {
            onClose();
            closeCreatePackModal();
            void navigate({ to: '/cart' });
            setIsExiting(false);
          }, 400);
        },
      }
    );
  };

  const totalCards = pack.packCards.reduce((sum, pc) => sum + pc.quantity, 0);

  return (
    <div
      className={`${styles.overlay} ${isExiting ? styles.overlayExiting : ''}`}
      onClick={handleOverlayClick}
    >
      <div className={`${styles.container} ${isExiting ? styles.containerExiting : ''}`}>
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
          <Text c="dimmed" size="sm" ta="center" mt={4}>
            Your pack with {totalCards} {totalCards === 1 ? 'card' : 'cards'} is ready
          </Text>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            disabled={isExiting}
          >
            <X size={24} />
          </button>
        </div>

        {/* Pack Preview */}
        <div className={styles.content}>
          <PackItem pack={pack} readOnly />
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
