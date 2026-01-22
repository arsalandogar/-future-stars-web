import type { User } from '@/types';

import { api } from '@/lib/api-client';
import { createMutation } from '@/lib/react-query';

export interface UpdateProfileParams {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
}

export const useUpdateProfile = createMutation({
  mutationFn: (params: UpdateProfileParams): Promise<User> =>
    api.patch('users/profile', params),
});
