import { Badge, Table, Text } from '@mantine/core';

import { formatDate } from '@/utils/date';

import type { UserPack } from '../types';

interface PackRowProps {
  pack: UserPack;
}

export function PackRow({ pack }: PackRowProps) {
  const totalCards =
    pack.packCards?.reduce((sum, pc) => sum + pc.quantity, 0) ?? 0;

  return (
    <>
      <Table.Td>
        <Text size="sm" fw={500}>
          #{pack.id}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm" fw={500}>
          {pack.name}
        </Text>
      </Table.Td>
      <Table.Td>
        <Badge size="sm" variant="light" color="blue">
          {pack.packCards?.length ?? 0} designs
        </Badge>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{totalCards} cards</Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{formatDate(pack.createdAt)}</Text>
      </Table.Td>
    </>
  );
}
