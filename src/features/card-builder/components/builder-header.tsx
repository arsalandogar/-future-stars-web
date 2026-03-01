import { Button, Title } from '@mantine/core';
import { Save } from 'lucide-react';

import { useSaveCard } from '../api/save-card';
import { useCardEditorStore } from '../stores/card-editor-store';
import { type EditValue, getEditUrl } from '@fs-card-engine';
import { useImageUploadStore } from '../stores/image-upload-store';

import styles from './builder-header.module.css';

interface BuilderHeaderProps {
  canSave: boolean;
  templateId?: number;
  backTemplateId: number | null;
}

function cleanBlobEdits(
  edits: Partial<Record<string, EditValue>>
): Record<string, EditValue> {
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
  const uploading = useImageUploadStore((s) =>
    Object.values(s.uploads).some((e) => e.status === 'uploading')
  );
  const saveCard = useSaveCard();

  const handleSave = () => {
    if (!templateId) return;

    const { frontEdits, backEdits } = getEditsForSave();
    const cleanFront = cleanBlobEdits(frontEdits);
    const cleanBack = cleanBlobEdits(backEdits);

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
