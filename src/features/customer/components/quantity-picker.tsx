import { ActionIcon, Text } from '@mantine/core';
import { Minus, Plus } from 'lucide-react';

import styles from './quantity-picker.module.css';

interface QuantityPickerProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export function QuantityPicker({
  value,
  onChange,
  min = 1,
  max = 99,
}: QuantityPickerProps) {
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
    <div className={styles.container}>
      <ActionIcon
        variant="transparent"
        size="xl"
        onClick={handleDecrement}
        disabled={value <= min}
        className={styles.button}
      >
        <Minus size={24} />
      </ActionIcon>
      <Text className={styles.value}>{value}</Text>
      <ActionIcon
        variant="transparent"
        size="xl"
        onClick={handleIncrement}
        disabled={value >= max}
        className={styles.button}
      >
        <Plus size={24} />
      </ActionIcon>
    </div>
  );
}
