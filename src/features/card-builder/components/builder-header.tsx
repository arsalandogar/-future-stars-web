import { Button, Title } from '@mantine/core';
import { Save } from 'lucide-react';

import {
  type DiscoveredFields,
  cleanEditsForPersistence,
} from '@fs-card-engine';

import type { PersistCardPayload } from '../api/save-card';
import { useCardEditorStore } from '../stores/card-editor-store';
import { useImageUploadStore } from '../stores/image-upload-store';

import styles from './builder-header.module.css';

interface BuilderHeaderProps {
  canSave: boolean;
  templateId?: number;
  backTemplateId: number | null;
  isSaving: boolean;
  onSave: (payload: PersistCardPayload) => void;
}

export function BuilderHeader({
  canSave,
  templateId,
  backTemplateId,
  isSaving,
  onSave,
}: BuilderHeaderProps) {
  const uploading = useImageUploadStore((s) =>
    Object.values(s.uploads).some((e) => e.status === 'uploading')
  );

  const handleSave = () => {
    if (!templateId) return;

    const store = useCardEditorStore.getState();
    const { frontEdits, backEdits } = store.getEditsForSave();
    const { sides } = store;

    const frontFields: DiscoveredFields = {
      textFields: sides.front.editableFields,
      colorFields: sides.front.editableColorFields,
      imageFields: sides.front.editableImageFields,
    };
    const backFields: DiscoveredFields = {
      textFields: sides.back.editableFields,
      colorFields: sides.back.editableColorFields,
      imageFields: sides.back.editableImageFields,
    };

    const cleanFront = cleanEditsForPersistence(frontEdits, frontFields);
    const cleanBack = cleanEditsForPersistence(backEdits, backFields);

    onSave({
      templateId,
      editsJson: cleanFront,
      backTemplateId,
      backEditsJson: cleanBack,
    });
  };

  return (
    <div className={styles.header}>
      <Title order={2} className={styles.title}>
        CUSTOMIZE CARD
      </Title>
      <Button
        variant="filled"
        color="primary"
        radius="xl"
        leftSection={<Save size={16} />}
        disabled={!canSave || uploading}
        loading={isSaving}
        onClick={handleSave}
      >
        Save Card
      </Button>
    </div>
  );
}
