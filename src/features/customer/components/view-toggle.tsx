import { ActionIcon } from '@mantine/core';
import { LayoutGrid, List } from 'lucide-react';

import styles from './view-toggle.module.css';

export type ViewMode = 'grid' | 'list';

interface ViewToggleProps {
  view: ViewMode;
  onChange: (view: ViewMode) => void;
}

export function ViewToggle({ view, onChange }: ViewToggleProps) {
  return (
    <div className={styles.container}>
      <ActionIcon
        variant={view === 'grid' ? 'filled' : 'default'}
        size="lg"
        onClick={() => onChange('grid')}
        className={styles.button}
        aria-label="Grid view"
      >
        <LayoutGrid size={20} />
      </ActionIcon>
      <ActionIcon
        variant={view === 'list' ? 'filled' : 'default'}
        size="lg"
        onClick={() => onChange('list')}
        className={styles.button}
        aria-label="List view"
      >
        <List size={20} />
      </ActionIcon>
    </div>
  );
}
