import { notifications } from '@mantine/notifications';

import type { Address } from '@/types';

import { api } from '@/lib/api-client';
import { createMutation, invalidateQueries } from '@/lib/react-query';

import { useAddresses } from './get-addresses';

export const useSetDefaultAddress = createMutation({
  mutationFn: (id: number): Promise<Address> =>
    api.patch(`addresses/${id}/set-default`),
  use: [invalidateQueries([useAddresses.getKey()])],
  onSuccess: () => {
    notifications.show({
      title: 'Default Address Updated',
      message: 'Your default shipping address has been updated.',
      color: 'green',
    });
  },
});
