import { DataTable, type Column } from '@/components/ui/data-table';
import { useListingContext } from '@/components/ui/listing';

import { useUserCards } from '../api/get-user-cards';
import { CardRow } from './card-row';

const COLUMNS: Column[] = [
  { label: 'ID', width: 80 },
  { label: 'Preview', width: 70 },
  { label: 'Template' },
  { label: 'Status', width: 140 },
  { label: 'Visibility', width: 140 },
  { label: 'Created', width: 120 },
];

interface CardsTableProps {
  userId: number;
}

export function CardsList({ userId }: CardsTableProps) {
  const { page, limit, search } = useListingContext();

  const queryResult = useUserCards({
    variables: { userId, page, limit, search: search || undefined },
  });

  return (
    <DataTable
      columns={COLUMNS}
      queryResult={queryResult}
      emptyMessage="No cards found"
      keyExtractor={(card) => card.id}
      renderRow={(card) => <CardRow card={card} />}
    />
  );
}
