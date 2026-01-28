import { useCallback, useState } from 'react';

import type { CartItem as CartItemType } from '@/types';

import { CartFooter } from './cart-footer';
import { CartItem } from './cart-item';
import styles from './cart-items-list.module.css';

const REMOVE_ANIMATION_MS = 250;

interface CartItemsListProps {
  items: CartItemType[];
  onQuantityChange: (itemId: number, quantity: number) => void;
  onDelete: (itemId: number) => void;
  onViewPack: (pack: CartItemType['pack']) => void;
  totalPacks: number;
  totalPrice: number;
}

export function CartItemsList({
  items,
  onQuantityChange,
  onDelete,
  onViewPack,
  totalPacks,
  totalPrice,
}: CartItemsListProps) {
  const [removingIds, setRemovingIds] = useState<Set<number>>(() => new Set());

  const handleDelete = useCallback(
    (itemId: number) => {
      setRemovingIds((prev) => new Set(prev).add(itemId));
      setTimeout(() => {
        onDelete(itemId);
        setRemovingIds((prev) => {
          const next = new Set(prev);
          next.delete(itemId);
          return next;
        });
      }, REMOVE_ANIMATION_MS);
    },
    [onDelete]
  );

  return (
    <div className={styles.container}>
      <div className={styles.itemsContainer}>
        {items.map((item) => (
          <CartItem
            key={item.id}
            item={item}
            quantity={item.quantity}
            onQuantityChange={(qty) => onQuantityChange(item.id, qty)}
            onDelete={() => handleDelete(item.id)}
            onViewPack={() => onViewPack(item.pack)}
            removing={removingIds.has(item.id)}
          />
        ))}
      </div>
      <CartFooter packCount={totalPacks} totalPrice={totalPrice} />
    </div>
  );
}
