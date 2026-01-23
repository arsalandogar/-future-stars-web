import { api } from '@/lib/api-client';
import { createMutation, invalidateQueries } from '@/lib/react-query';

import { useAddresses } from './get-addresses';

export const useDeleteAddress = createMutation({
  mutationFn: (id: number): Promise<void> => api.delete(`addresses/${id}`),
  use: [invalidateQueries([useAddresses.getKey()])],
});
