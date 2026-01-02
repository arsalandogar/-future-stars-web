import type { ReactNode } from 'react';

import { ListingContext, type ListingContextValue } from './listing-context';

export function ListingProvider({
  value,
  children,
}: {
  value: ListingContextValue;
  children: ReactNode;
}) {
  return <ListingContext value={value}>{children}</ListingContext>;
}
