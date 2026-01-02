import { createContext } from 'react';

export interface ListingContextValue {
  page: number;
  limit: number;
  search: string;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setSearch: (search: string) => void;
}

export const ListingContext = createContext<ListingContextValue | null>(null);
