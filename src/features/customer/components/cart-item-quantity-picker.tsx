import { ActionIcon } from '@mantine/core';
import { Minus, Plus, Trash2 } from 'lucide-react';

import styles from './cart-item-quantity-picker.module.css';

interface CartItemQuantityPickerProps {
  value: number;
  onChange: (value: number) => void;
  onDelete: () => void;
  max?: number;
}

export function CartItemQuantityPicker({
  value,
  onChange,
  onDelete,
  max = 99,
}: CartItemQuantityPickerProps) {
  const handleDecrement = () => {
    if (value === 1) {
      onDelete();
    } else if (value > 1) {
      onChange(value - 1);
    }
  };

  const handleIncrement = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  return (
    <div className={styles.container}>
      <ActionIcon
        variant="transparent"
        size="lg"
        onClick={handleDecrement}
        className={styles.button}
      >
        {value === 1 ? (
          <Trash2 size={20} strokeWidth={2.5} />
        ) : (
          <Minus size={20} strokeWidth={3} />
        )}
      </ActionIcon>
      <span className={styles.value}>{value}</span>
      <ActionIcon
        variant="transparent"
        size="lg"
        onClick={handleIncrement}
        disabled={value >= max}
        className={styles.button}
      >
        <Plus size={20} strokeWidth={3} />
      </ActionIcon>
    </div>
  );
}
