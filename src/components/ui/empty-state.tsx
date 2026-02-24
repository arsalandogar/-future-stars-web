import { Button, Text, Title } from '@mantine/core';
import { Link } from '@tanstack/react-router';
import type { ComponentProps, ReactNode } from 'react';

import styles from './empty-state.module.css';

type EmptyStateShape = 'square' | 'rectangle' | 'circle';

interface EmptyStateProps {
  shape?: EmptyStateShape;
  icon: ReactNode;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  actionIcon?: ReactNode;
  onAction?: () => void;
  actionTo?: ComponentProps<typeof Link>['to'];
}

export function EmptyState({
  shape = 'rectangle',
  icon,
  title,
  subtitle,
  actionLabel,
  actionIcon,
  onAction,
  actionTo,
}: EmptyStateProps) {
  return (
    <div className={styles.container}>
      <div className={styles.shapeWrapper}>
        <div className={styles.glow} />
        <div className={`${styles.shape} ${styles[shape]}`}>{icon}</div>
      </div>

      <div className={styles.textWrapper}>
        <Title order={2} c="white" className={styles.title}>
          {title}
        </Title>
        {subtitle && (
          <Text size="lg" c="dimmed" className={styles.subtitle}>
            {subtitle}
          </Text>
        )}
      </div>

      {actionLabel && actionTo && (
        <Button
          component={Link}
          to={actionTo}
          size="lg"
          radius="xl"
          leftSection={actionIcon}
        >
          {actionLabel}
        </Button>
      )}

      {actionLabel && !actionTo && onAction && (
        <Button
          size="lg"
          radius="xl"
          leftSection={actionIcon}
          onClick={onAction}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
