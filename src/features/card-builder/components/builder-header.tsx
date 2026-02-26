import { Button, Title } from '@mantine/core';

import { useSaveCard } from '../api/save-card';
import { useCardEditorStore } from '../stores/card-editor-store';

import styles from './builder-header.module.css';

interface BuilderHeaderProps {
  canSave: boolean;
  templateId?: number;
}

export function BuilderHeader({ canSave, templateId }: BuilderHeaderProps) {
  const edits = useCardEditorStore((s) => s.edits);
  const saveCard = useSaveCard();

  const handleSave = () => {
    if (!templateId) return;
    saveCard.mutate({ templateId, editsJson: edits as Record<string, string> });
  };

  return (
    <div className={styles.header}>
      <Title order={2} className={styles.title}>
        CUSTOMIZE CARD
      </Title>
      <Button
        variant="filled"
        color="dark.5"
        radius="xl"
        disabled={!canSave}
        loading={saveCard.isPending}
        onClick={handleSave}
      >
        Save Card
      </Button>
    </div>
  );
}
