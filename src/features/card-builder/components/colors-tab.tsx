import { Palette } from 'lucide-react';

import { useCardEditorStore } from '../stores/card-editor-store';
import { ActiveColorsBar } from './active-colors-bar';
import { ColorSourceTabs } from './color-source-tabs';
import { TabEmptyState } from './tab-empty-state';

import styles from './tab-panel.module.css';

export function ColorsTab() {
  const editableColorFields = useCardEditorStore((s) => s.editableColorFields);

  if (editableColorFields.length === 0) {
    return (
      <div className={styles.container}>
        <TabEmptyState
          icon={<Palette size={40} />}
          message="Select a template to customize colors"
        />
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
