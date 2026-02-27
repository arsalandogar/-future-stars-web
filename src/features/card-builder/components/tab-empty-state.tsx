import type { ReactNode } from 'react';
import { Text } from '@mantine/core';

import styles from './tab-panel.module.css';

interface TabEmptyStateProps {
  icon: ReactNode;
  message: string;
}

export function TabEmptyState({ icon, message }: TabEmptyStateProps) {
  return (
    <div className={styles.empty}>
      <div style={{ color: '#2a3045' }}>{icon}</div>
      <Text c="dimmed" ta="center">
        {message}
      </Text>
      <Text size="xs" c="dark.3" ta="center">
        Browse the Templates tab to get started
      </Text>
    </div>
  );
}
