import { notifications } from '@mantine/notifications';

import { api } from '@/lib/api-client';
import { createMutation, invalidateQueries } from '@/lib/react-query';
import type { Pack } from '@/types';

import { useCartItems } from './get-cart-items';
import { useUserPacks } from './get-user-packs';

export interface AutofillPackParams {
  id: number;
  mode: 'selected' | 'gallery';
}

interface AutofillPackResponse {
  success: boolean;
  message: string;
  data: Pack;
}

export const useAutofillPack = createMutation({
  mutationFn: ({
    id,
    mode,
  }: AutofillPackParams): Promise<AutofillPackResponse> =>
    api.post(`packs/${id}/autofill`, { mode }),
  use: [invalidateQueries([useUserPacks.getKey(), useCartItems.getKey()])],
  onSuccess: () => {
    notifications.show({
      title: 'Pack Updated',
      message: 'Your pack has been filled to 20 cards!',
      color: 'green',
    });
  },
});
