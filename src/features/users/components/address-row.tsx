import { Badge, Group, Table, Text } from '@mantine/core';

import type { UserAddress } from '../types';

interface AddressRowProps {
  address: UserAddress;
}

export function AddressRow({ address }: AddressRowProps) {
  const fullName = `${address.firstName} ${address.lastName}`;
  const fullAddress = [address.addressLine1, address.addressLine2]
    .filter(Boolean)
    .join(', ');
  const cityState = `${address.city}, ${address.state} ${address.postalCode}`;

  return (
    <>
      <Table.Td>
        <Text size="sm" fw={500}>
          {fullName}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm" lineClamp={1}>
          {fullAddress}
        </Text>
        <Text size="xs" c="dimmed">
          {cityState}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{address.country}</Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{address.phone ?? '—'}</Text>
      </Table.Td>
      <Table.Td>
        <Group gap="xs">
          {address.isDefault && (
            <Badge size="xs" variant="light" color="blue">
              Default
            </Badge>
          )}
          {address.isVerified && (
            <Badge size="xs" variant="light" color="green">
              Verified
            </Badge>
          )}
        </Group>
      </Table.Td>
    </>
  );
}
