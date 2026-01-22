import { ActionIcon, Text } from '@mantine/core';
import { Minus, Plus } from 'lucide-react';

import styles from './quantity-picker.module.css';

interface QuantityPickerProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  size?: 'sm' | 'lg';
}

export function QuantityPicker({
  value,
  onChange,
  min = 1,
  max = 99,
  size = 'lg',
}: QuantityPickerProps) {
  const iconSize = size === 'sm' ? 18 : 24;
  const actionIconSize = size === 'sm' ? 'md' : 'xl';
  const handleDecrement = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const handleIncrement = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  return (
    <div className={`${styles.container} ${size === 'sm' ? styles.small : ''}`}>
      <ActionIcon
        variant="transparent"
        size={actionIconSize}
        c="primaryLight"
        onClick={handleDecrement}
        disabled={value <= min}
        className={styles.button}
      >
        <Minus size={iconSize} />
      </ActionIcon>
      <Text className={styles.value}>{value}</Text>
      <ActionIcon
        variant="transparent"
        size={actionIconSize}
        c="primaryLight"
        onClick={handleIncrement}
        disabled={value >= max}
        className={styles.button}
      >
        <Plus size={iconSize} />
      </ActionIcon>
    </div>
  );
}
