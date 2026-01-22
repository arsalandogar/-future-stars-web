import { useAddedToCartPopupStore } from '../stores/added-to-cart-popup-store';
import { AddedToCartPopup } from './added-to-cart-popup';

export function GlobalAddedToCartPopup() {
  const { isOpen, cartItem, close } = useAddedToCartPopupStore();

  if (!isOpen || !cartItem) {
    return null;
  }

  return <AddedToCartPopup cartItem={cartItem} onClose={close} />;
}
