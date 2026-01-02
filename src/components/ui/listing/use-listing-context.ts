import { use } from 'react';

import { ListingContext } from './listing-context';

export function useListingContext() {
  const context = use(ListingContext);
  if (!context) {
    throw new Error(
      'useListingContext must be used within a listing layout route'
    );
  }
  return context;
}
