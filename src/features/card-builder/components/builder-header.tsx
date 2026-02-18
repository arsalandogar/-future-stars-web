import { Button, Title } from '@mantine/core';

import styles from './builder-header.module.css';

interface BuilderHeaderProps {
  canSave: boolean;
}

export function BuilderHeader({ canSave }: BuilderHeaderProps) {
  return (
    <div className={styles.header}>
      <Title order={2} className={styles.title}>
        CUSTOMIZE CARD
      </Title>
      <Button variant="filled" color="dark.5" radius="xl" disabled={!canSave}>
        Save Card
      </Button>
    </div>
  );
}
