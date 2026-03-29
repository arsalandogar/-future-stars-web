import { Button } from '@mantine/core';
import { MdOutlineShoppingCart } from 'react-icons/md';

import { useCreatePackModalStore } from '@/features/customer';

interface BuyCardButtonProps {
  cardId: number;
  quantity?: number;
  size?: 'sm' | 'lg';
  loading?: boolean;
  className?: string;
}

export function BuyCardButton({
  cardId,
  quantity = 1,
  size = 'lg',
  loading,
  className,
}: BuyCardButtonProps) {
  const openBuy = useCreatePackModalStore((s) => s.openBuy);

  return (
    <Button
      variant="filled"
      size={size}
      radius="xl"
      fw={600}
      leftSection={<MdOutlineShoppingCart size={size === 'sm' ? 16 : 20} />}
      className={className}
      onClick={() => openBuy(cardId, quantity)}
      loading={loading}
    >
      Buy this Card
    </Button>
  );
}
