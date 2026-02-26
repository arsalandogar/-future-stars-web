import { Text } from '@mantine/core';

import { useCardEditorStore } from '../stores/card-editor-store';
import { ContentField } from './content-field';

import styles from './content-tab.module.css';

export function ContentTab() {
  const editableFields = useCardEditorStore((s) => s.editableFields);

  if (editableFields.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.empty}>
          <Text c="dimmed" ta="center">
            Select a template to edit content
          </Text>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.fields}>
        {editableFields.map((field) => (
          <ContentField key={field.fieldId} field={field} />
        ))}
      </div>
    </div>
  );
}
