import { Text } from '@mantine/core';

import styles from './photo-tab.module.css';

export function PhotoTab() {
  return (
    <div className={styles.container}>
      <Text c="dimmed" ta="center" py="xl">
        Photo upload coming soon
      </Text>
    </div>
  );
}
