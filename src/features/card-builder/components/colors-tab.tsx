import { Palette } from 'lucide-react';

import { useCardEditorStore } from '../stores/card-editor-store';
import { ActiveColorsBar } from './active-colors-bar';
import { ColorSourceTabs } from './color-source-tabs';
import { TabEmptyState } from './tab-empty-state';

import styles from './tab-panel.module.css';

export function ColorsTab() {
  const editableColorFields = useCardEditorStore(
    (s) => s.sides[s.activeSide].editableColorFields
  );
  const hasTemplate = useCardEditorStore(
    (s) => s.sides[s.activeSide].workingCopy !== null
  );

  if (editableColorFields.length === 0) {
    return (
      <div className={styles.container}>
        <TabEmptyState
          icon={<Palette size={40} />}
          message={
            hasTemplate
              ? 'This template has no editable color fields'
              : 'Select a template to customize colors'
          }
          hint={
            hasTemplate
              ? 'Choose a different template to edit colors.'
              : 'Browse the Templates tab to get started'
          }
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
