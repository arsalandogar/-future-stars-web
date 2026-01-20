import type { MantineColor } from '@mantine/core';

import type { UserRole } from '@/types';

import type { CardStatus } from './types';

export const USER_ROLE_COLORS: Record<UserRole, MantineColor> = {
  admin: 'violet',
  user: 'blue',
  guest: 'gray',
};

export const CARD_STATUS_COLORS: Record<CardStatus, MantineColor> = {
  draft: 'gray',
  processing: 'blue',
  completed: 'green',
  failed: 'red',
};
