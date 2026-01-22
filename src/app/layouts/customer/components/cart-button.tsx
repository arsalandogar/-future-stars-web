import { ActionIcon, Indicator } from '@mantine/core';
import { Link } from '@tanstack/react-router';
import { MdOutlineShoppingCart } from 'react-icons/md';

import { useCartItems } from '@/features/customer/api/get-cart-items';

export function CartButton() {
  const { data } = useCartItems();
  const cartItemCount = data?.data.length ?? 0;

  const ariaLabel =
    cartItemCount > 0
      ? `Shopping cart, ${cartItemCount} items`
      : 'Shopping cart';

  return (
    <Indicator
      label={cartItemCount}
      size={18}
      offset={4}
      disabled={cartItemCount === 0}
      color="primary"
      styles={{ indicator: { fontWeight: 700 } }}
    >
      <ActionIcon
        component={Link}
        to="/cart"
        variant="subtle"
        size="lg"
        color="gray"
        aria-label={ariaLabel}
      >
        <MdOutlineShoppingCart size={22} color="white" />
      </ActionIcon>
    </Indicator>
  );
}
