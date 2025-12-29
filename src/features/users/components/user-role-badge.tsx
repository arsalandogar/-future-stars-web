import { Badge } from '@mantine/core';

import type { UserRole } from '@/types';

import { USER_ROLE_COLORS, USER_ROLE_LABELS } from '../constants';

interface UserRoleBadgeProps {
  role: UserRole;
}

export function UserRoleBadge({ role }: UserRoleBadgeProps) {
  return (
    <Badge color={USER_ROLE_COLORS[role]} variant="light" size="sm">
      {USER_ROLE_LABELS[role]}
    </Badge>
  );
}
