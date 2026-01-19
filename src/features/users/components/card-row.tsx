import { Anchor, Avatar, Badge, Group, Table, Text } from '@mantine/core';

import { MappedBadge } from '@/components/ui/mapped-badge';
import { formatDate } from '@/utils/date';

import { CARD_STATUS_COLORS } from '../constants';
import type { UserCard } from '../types';
import { Link } from '@tanstack/react-router';

interface CardRowProps {
  card: UserCard;
}

export function CardRow({ card }: CardRowProps) {
  return (
    <>
      <Table.Td>
        <Text size="sm" fw={500}>
          #{card?.id}
        </Text>
      </Table.Td>
      <Table.Td>
        <Avatar
          src={card.frontCardImage}
          size="lg"
          radius="sm"
          alt={`Card #${card.id}`}
        />
      </Table.Td>
      <Table.Td>
        {card.template.label ? (
          <Anchor
            component={Link}
            to={`/admin/templates/${card.template.id}`}
            size="md"
            fw={500}
          >
            {card.template.label}
          </Anchor>
        ) : (
          <Text size="sm">{'—'}</Text>
        )}
      </Table.Td>
      <Table.Td>
        <MappedBadge value={card.status} colorMap={CARD_STATUS_COLORS} />
      </Table.Td>
      <Table.Td>
        <Group gap="xs">
          {card.hiddenFromGallery && (
            <Badge size="xs" variant="light" color="orange">
              Hidden
            </Badge>
          )}
        </Group>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{formatDate(card.createdAt)}</Text>
      </Table.Td>
    </>
  );
}
