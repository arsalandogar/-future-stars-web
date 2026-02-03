import { Button, Text, Title } from '@mantine/core';
import { useNavigate } from '@tanstack/react-router';
import { X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { MAX_PACK_CARDS } from '@/types';

import { useAddCartItem } from '../api/add-cart-item';
import { useAutofillPack } from '../api/autofill-pack';
import { useCreatePackModalStore } from '../stores/create-pack-modal-store';
import { usePackAutofillModalStore } from '../stores/pack-autofill-modal-store';
import { getTotalCards } from '../utils/get-total-cards';

import styles from './pack-autofill-modal.module.css';

type AutofillOption = 'selected' | 'gallery' | 'manual' | 'proceed';

export function PackAutofillModal() {
  const navigate = useNavigate();
  const { isOpen, pack, needsAddToCart, close } = usePackAutofillModalStore();
  const { openEdit, close: closeCreatePackModal } = useCreatePackModalStore();
  const autofillPack = useAutofillPack();
  const addCartItem = useAddCartItem();

  const [selectedOption, setSelectedOption] =
    useState<AutofillOption>('selected');
  const [isExiting, setIsExiting] = useState(false);
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  const exitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (exitTimeoutRef.current) {
        clearTimeout(exitTimeoutRef.current);
      }
    };
  }, []);

  // Reset to default option when modal opens - adjust state during render
  if (isOpen && !prevIsOpen) {
    setSelectedOption('selected');
  }
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
  }

  if (!isOpen || !pack) return null;

  const totalCards = getTotalCards(pack.packCards);

  const OPTIONS: Array<{ value: AutofillOption; label: string }> = [
    { value: 'selected', label: 'Auto-fill with selected cards' },
    { value: 'gallery', label: 'Auto-fill with gallery cards' },
    { value: 'manual', label: 'Select more cards' },
    {
      value: 'proceed',
      label: `Proceed with ${totalCards} ${totalCards === 1 ? 'card' : 'cards'}`,
    },
  ];

  const isPending = autofillPack.isPending || addCartItem.isPending;

  const handleOverlayClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget && !isExiting && !isPending) {
      close();
    }
  };

  const handleClose = () => {
    if (!isExiting && !isPending) {
      close();
    }
  };

  const handleConfirm = () => {
    if (selectedOption === 'manual') {
      // Open edit pack modal to manually select more cards
      close();
      openEdit(pack);
      return;
    }

    if (selectedOption === 'proceed') {
      // Skip autofill - proceed with current cards
      const navigateToCart = () => {
        setIsExiting(true);
        exitTimeoutRef.current = setTimeout(() => {
          close();
          closeCreatePackModal();
          void navigate({ to: '/cart' });
          setIsExiting(false);
        }, 400);
      };

      if (needsAddToCart) {
        // Pack not in cart yet - add it first
        addCartItem.mutate(
          { packId: pack.id, quantity: 1 },
          { onSuccess: navigateToCart }
        );
      } else {
        // Pack already in cart - just navigate
        navigateToCart();
      }
      return;
    }

    // Call API for auto-fill
    autofillPack.mutate(
      { id: pack.id, mode: selectedOption },
      {
        onSuccess: () => {
          setIsExiting(true);
          exitTimeoutRef.current = setTimeout(() => {
            close();
            closeCreatePackModal();
            void navigate({ to: '/cart' });
            setIsExiting(false);
          }, 400);
        },
      }
    );
  };

  return (
    <div
      className={`${styles.overlay} ${isExiting ? styles.overlayExiting : ''}`}
      onClick={handleOverlayClick}
    >
      <div
        className={`${styles.container} ${isExiting ? styles.containerExiting : ''}`}
      >
        {/* Close Button Row */}
        <div className={styles.closeRow}>
          <button
            type="button"
            className={styles.closeButton}
            onClick={handleClose}
            disabled={isExiting || isPending}
          >
            <X size={24} />
          </button>
        </div>

        <div className={styles.innerContent}>
          {/* Header */}
          <div className={styles.header}>
            <Title order={2} className={styles.title}>
              Your Pack can hold more cards!
            </Title>
            <Text className={styles.subtitle}>
              You have selected only{' '}
              <span className={styles.highlightNumber}>{totalCards}</span> out
              of {MAX_PACK_CARDS} cards. The price is the same for a full pack!
            </Text>
          </div>

          {/* Radio Options */}
          <fieldset className={styles.content}>
            {OPTIONS.map((option) => (
              <label key={option.value} className={styles.radioOption}>
                <input
                  type="radio"
                  name="autofill-option"
                  value={option.value}
                  checked={selectedOption === option.value}
                  onChange={() => setSelectedOption(option.value)}
                  className={styles.radioInput}
                />
                <div
                  className={styles.radioCircle}
                  data-selected={selectedOption === option.value}
                  aria-hidden="true"
                >
                  <div className={styles.radioCircleInner} />
                </div>
                <span className={styles.radioLabel}>{option.label}</span>
              </label>
            ))}
          </fieldset>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <Button
            variant="filled"
            size="md"
            radius="xl"
            className={styles.confirmButton}
            onClick={handleConfirm}
            loading={isPending}
            disabled={isExiting}
          >
            Confirm
          </Button>
        </div>
      </div>
    </div>
  );
}
