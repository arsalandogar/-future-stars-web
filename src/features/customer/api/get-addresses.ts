import type { Address } from '@/types';

import { api } from '@/lib/api-client';
import { createQuery } from '@/lib/react-query';

export interface AddressesResponse {
  data: Address[];
}

export const useAddresses = createQuery({
  queryKey: ['customer', 'addresses'],
  fetcher: (): Promise<AddressesResponse> => api.get('addresses'),
});
