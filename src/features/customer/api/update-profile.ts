import type { User } from '@/types';

import { api } from '@/lib/api-client';
import { createMutation } from '@/lib/react-query';

export interface UpdateProfileParams {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
}

interface UpdateProfileResponse {
  data: User;
}

export const useUpdateProfile = createMutation({
  mutationFn: async (params: UpdateProfileParams): Promise<User> => {
    const response: UpdateProfileResponse = await api.patch(
      'users/profile',
      params
    );
    return response.data;
  },
});
