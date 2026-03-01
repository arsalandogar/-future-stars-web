import { Type } from 'lucide-react';

import { useCardEditorStore } from '../stores/card-editor-store';
import { ContentField } from './content-field';
import { TabEmptyState } from './tab-empty-state';

import contentStyles from './content-tab.module.css';
import styles from './tab-panel.module.css';

export function ContentTab() {
  const editableFields = useCardEditorStore(
    (s) => s.sides[s.activeSide].editableFields
  );
  const hasTemplate = useCardEditorStore(
    (s) => s.sides[s.activeSide].workingCopy !== null
  );

  if (editableFields.length === 0) {
    return (
      <div className={styles.container}>
        <TabEmptyState
          icon={<Type size={40} />}
          message={
            hasTemplate
              ? 'This template has no editable content fields'
              : 'Select a template to edit content'
          }
          hint={
            hasTemplate
              ? 'Choose a different template to edit content.'
              : 'Browse the Templates tab to get started'
          }
        />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={contentStyles.fields}>
        {editableFields.map((field) => (
          <ContentField key={field.fieldId} field={field} />
        ))}
      </div>
    </div>
  );
}
