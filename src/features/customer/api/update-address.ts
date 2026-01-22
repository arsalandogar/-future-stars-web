import { notifications } from '@mantine/notifications';

import type { Address, UpdateAddressParams } from '@/types';

import { api } from '@/lib/api-client';
import { createMutation, invalidateQueries } from '@/lib/react-query';

import { useAddresses } from './get-addresses';

export const useUpdateAddress = createMutation({
  mutationFn: ({ id, ...params }: UpdateAddressParams): Promise<Address> =>
    api.put(`addresses/${id}`, params),
  use: [invalidateQueries([useAddresses.getKey()])],
  onSuccess: () => {
    notifications.show({
      title: 'Address Updated',
      message: 'Your address has been updated.',
      color: 'green',
    });
  },
});
