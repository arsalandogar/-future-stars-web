import { Text } from '@mantine/core';

import { useCardEditorStore } from '../stores/card-editor-store';
import { ActiveColorsBar } from './active-colors-bar';
import { ColorSourceTabs } from './color-source-tabs';

import styles from './colors-tab.module.css';

export function ColorsTab() {
  const editableColorFields = useCardEditorStore((s) => s.editableColorFields);

  if (editableColorFields.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.empty}>
          <Text c="dimmed" ta="center">
            Select a template to customize colors
          </Text>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <ActiveColorsBar />
      <ColorSourceTabs />
    </div>
  );
}
