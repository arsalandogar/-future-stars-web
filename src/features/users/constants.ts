import type { MantineColor } from '@mantine/core';

import type { UserRole } from './types';

export const USER_ROLE_COLORS: Record<UserRole, MantineColor> = {
  admin: 'violet',
  user: 'blue',
  guest: 'gray',
};

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Admin',
  user: 'User',
  guest: 'Guest',
};
