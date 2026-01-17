import { Badge, Table, Text } from '@mantine/core';

import { formatDate } from '@/utils/date';

import type { UserCartItem } from '../types';

interface CartItemRowProps {
  cartItem: UserCartItem;
}

export function CartItemRow({ cartItem }: CartItemRowProps) {
  return (
    <>
      <Table.Td>
        <Text size="sm" fw={500}>
          #{cartItem.id}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm" fw={500}>
          {cartItem.pack?.name ?? '—'}
        </Text>
      </Table.Td>
      <Table.Td>
        <Badge size="sm" variant="light" color="blue">
          {cartItem.quantity}
        </Badge>
      </Table.Td>
      <Table.Td>
        {cartItem.orderId ? (
          <Badge size="sm" variant="light" color="green">
            Ordered
          </Badge>
        ) : (
          <Badge size="sm" variant="light" color="gray">
            In Cart
          </Badge>
        )}
      </Table.Td>
      <Table.Td>
        <Text size="sm">{formatDate(cartItem.createdAt)}</Text>
      </Table.Td>
    </>
  );
}
