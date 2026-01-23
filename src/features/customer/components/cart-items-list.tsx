import type { CartItem as CartItemType } from '@/types';

import { CartFooter } from './cart-footer';
import { CartItem } from './cart-item';
import styles from './cart-items-list.module.css';

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
  return (
    <div className={styles.container}>
      <div className={styles.itemsContainer}>
        {items.map((item) => (
          <CartItem
            key={item.id}
            item={item}
            quantity={item.quantity}
            onQuantityChange={(qty) => onQuantityChange(item.id, qty)}
            onDelete={() => onDelete(item.id)}
            onViewPack={() => onViewPack(item.pack)}
          />
        ))}
      </div>
      <CartFooter packCount={totalPacks} totalPrice={totalPrice} />
    </div>
  );
}
