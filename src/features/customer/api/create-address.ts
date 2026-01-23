import { notifications } from '@mantine/notifications';

import type { Address, CreateAddressParams } from '@/types';

import { api } from '@/lib/api-client';
import { createMutation, invalidateQueries } from '@/lib/react-query';

import { useAddresses } from './get-addresses';

export const useCreateAddress = createMutation({
  mutationFn: (params: CreateAddressParams): Promise<Address> =>
    api.post('addresses', params),
  use: [invalidateQueries([useAddresses.getKey()])],
  onSuccess: () => {
    notifications.show({
      title: 'Address Added',
      message: 'Your shipping address has been saved.',
      color: 'green',
    });
  },
});
