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

  if (editableFields.length === 0) {
    return (
      <div className={styles.container}>
        <TabEmptyState
          icon={<Type size={40} />}
          message="Select a template to edit content"
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
