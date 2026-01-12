import { ActionIcon, Indicator } from '@mantine/core';
import { Link } from '@tanstack/react-router';
import { ShoppingCart } from 'lucide-react';

export function CartButton() {
  // TODO: Connect to cart state/query when available
  const cartItemCount = 0;

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
    >
      <ActionIcon
        component={Link}
        to="/cart"
        variant="subtle"
        size="lg"
        color="gray"
        aria-label={ariaLabel}
      >
        <ShoppingCart size={22} color="white" />
      </ActionIcon>
    </Indicator>
  );
}
