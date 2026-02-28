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
}

export function BuilderHeader({ canSave, templateId }: BuilderHeaderProps) {
  const edits = useCardEditorStore((s) => s.edits);
  const uploading = useImageUploadStore((s) =>
    Object.values(s.uploads).some((e) => e.status === 'uploading')
  );
  const saveCard = useSaveCard();

  const handleSave = () => {
    if (!templateId) return;

    const cleanEdits = Object.fromEntries(
      Object.entries(edits).filter(
        ([, value]) => value && !getEditUrl(value)?.startsWith('blob:')
      )
    ) as Record<string, EditValue>;

    saveCard.mutate({ templateId, editsJson: cleanEdits });
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
