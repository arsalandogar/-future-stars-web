import { Text, Title } from '@mantine/core';
import type { ReactNode } from 'react';

import styles from './account-section.module.css';

interface AccountSectionHeaderProps {
  title: string;
  description: string;
  action?: ReactNode;
}

export function AccountSectionHeader({
  title,
  description,
  action,
}: AccountSectionHeaderProps) {
  return (
    <div className={styles.header}>
      <div>
        <Title order={2} c="white" fw={800} className={styles.title}>
          {title}
        </Title>
        <Text component="span" c="dimmed" size="md" display="block">
          {description}
        </Text>
      </div>
      {action}
    </div>
  );
}
