import { Button, Title } from '@mantine/core';
import { useNavigate } from '@tanstack/react-router';
import { Check, CreditCard, ShoppingCart, X } from 'lucide-react';
import { useCallback, useEffect, useRef } from 'react';

import type { CartItem as CartItemType } from '@/types';

import styles from './added-to-cart-popup.module.css';
import { CartItem } from './cart-item';

const AUTO_DISMISS_MS = 5000;

interface AddedToCartPopupProps {
  cartItem: CartItemType;
  onClose: () => void;
}

export function AddedToCartPopup({ cartItem, onClose }: AddedToCartPopupProps) {
  const navigate = useNavigate();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    clearTimer();
    timerRef.current = setTimeout(() => {
      onClose();
    }, AUTO_DISMISS_MS);
  }, [clearTimer, onClose]);

  // Start auto-dismiss timer on mount and when cartItem changes
  useEffect(() => {
    startTimer();
    return clearTimer;
  }, [startTimer, clearTimer, cartItem]);

  // Handle overlay click (close when clicking outside the modal)
  const handleOverlayClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  // Pause timer on hover, resume on leave
  const handleMouseEnter = () => clearTimer();
  const handleMouseLeave = () => startTimer();

  const handleViewCart = () => {
    onClose();
    void navigate({ to: '/cart' });
  };

  const handleCheckout = () => {
    onClose();
    void navigate({ to: '/checkout' });
  };

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div
        className={styles.container}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <Check size={28} className={styles.checkIcon} />
          <Title order={4} c="white" m={0}>
            Added to cart!
          </Title>
        </div>
        <button type="button" className={styles.closeButton} onClick={onClose}>
          <X size={24} />
        </button>
      </div>

      <div className={styles.content}>
        <CartItem item={cartItem} readOnly />
      </div>

      <div className={styles.footer}>
        <Button
          variant="outline"
          size="md"
          radius="xl"
          leftSection={<ShoppingCart size={20} />}
          onClick={handleViewCart}
          className={styles.viewCartButton}
        >
          View Cart
        </Button>
        <Button
          variant="filled"
          size="md"
          radius="xl"
          leftSection={<CreditCard size={20} />}
          onClick={handleCheckout}
          className={styles.checkoutButton}
        >
          Checkout
        </Button>
      </div>
    </div>
    </div>
  );
}
