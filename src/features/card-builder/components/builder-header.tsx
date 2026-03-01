import { Button, Title } from '@mantine/core';
import { Save } from 'lucide-react';

import { useSaveCard } from '../api/save-card';
import { useCardEditorStore } from '../stores/card-editor-store';
import {
  type EditValue,
  type DiscoveredFields,
  type Edits,
  getEditUrl,
  cleanEditsForSave,
} from '@fs-card-engine';
import { useImageUploadStore } from '../stores/image-upload-store';

import styles from './builder-header.module.css';

interface BuilderHeaderProps {
  canSave: boolean;
  templateId?: number;
  backTemplateId: number | null;
}

function cleanBlobEdits(edits: Edits): Record<string, EditValue> {
  return Object.fromEntries(
    Object.entries(edits).filter(
      ([, value]) => value && !getEditUrl(value)?.startsWith('blob:')
    )
  ) as Record<string, EditValue>;
}

export function BuilderHeader({
  canSave,
  templateId,
  backTemplateId,
}: BuilderHeaderProps) {
  const getEditsForSave = useCardEditorStore((s) => s.getEditsForSave);
  const sides = useCardEditorStore((s) => s.sides);
  const uploading = useImageUploadStore((s) =>
    Object.values(s.uploads).some((e) => e.status === 'uploading')
  );
  const saveCard = useSaveCard();

  const handleSave = () => {
    if (!templateId) return;

    const { frontEdits, backEdits } = getEditsForSave();

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

    const cleanFront = cleanBlobEdits(
      cleanEditsForSave(frontEdits, frontFields)
    );
    const cleanBack = cleanBlobEdits(cleanEditsForSave(backEdits, backFields));

    saveCard.mutate({
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
        loading={saveCard.isPending}
        onClick={handleSave}
      >
        Save Card
      </Button>
    </div>
  );
}
