import type { ReactNode } from 'react';
import { Image, Loader, Text } from '@mantine/core';
import { AlertCircle, Check, ImageIcon } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';

import { useCardBuilderStore } from '../stores/card-builder-store';
import { useCardEditorStore } from '../stores/card-editor-store';
import { getEditUrl } from '@fs-card-engine';
import { toUploadKey, useImageUploadStore } from '../stores/image-upload-store';

import styles from './image-fields-list.module.css';

const STATUS_ICONS: Record<string, ReactNode> = {
  uploading: <Loader size={12} />,
  success: <Check size={12} color="var(--mantine-color-green-5)" />,
  error: <AlertCircle size={12} color="var(--mantine-color-red-5)" />,
};

export function ImageFieldsList() {
  const editableImageFields = useCardEditorStore(
    (s) => s.sides[s.activeSide].editableImageFields
  );
  const activeSide = useCardEditorStore((s) => s.activeSide);
  const imageEditUrls = useCardEditorStore(
    useShallow((s) => {
      const result: Record<string, string | undefined> = {};
      const active = s.sides[s.activeSide];
      for (const field of active.editableImageFields) {
        result[field.fieldId] = getEditUrl(active.edits[field.fieldId]);
      }
      return result;
    })
  );
  const selectedImageFieldId = useCardBuilderStore(
    (s) => s.selectedImageFieldId
  );
  const setSelectedImageFieldId = useCardBuilderStore(
    (s) => s.setSelectedImageFieldId
  );
  const uploads = useImageUploadStore((s) => s.uploads);

  return (
    <div className={styles.list}>
      {editableImageFields.map((field) => {
        const currentUrl = imageEditUrls[field.fieldId] ?? field.originalValue;
        const uploadKey = toUploadKey(activeSide, field.fieldId);
        const upload = uploads[uploadKey];
        const isSelected = selectedImageFieldId === field.fieldId;
        const hasImage = currentUrl && !currentUrl.startsWith('data:');

        return (
          <button
            key={field.fieldId}
            type="button"
            className={styles.item}
            data-selected={isSelected || undefined}
            onClick={() => setSelectedImageFieldId(field.fieldId)}
            aria-label={`Select ${field.label}`}
          >
            <div className={styles.thumbnail}>
              {hasImage ? (
                <Image
                  src={currentUrl}
                  alt={field.label}
                  fit="cover"
                  w="100%"
                  h="100%"
                />
              ) : (
                <ImageIcon size={20} className={styles.placeholderIcon} />
              )}
              {upload && (
                <div className={styles.statusBadge}>
                  {STATUS_ICONS[upload.status]}
                </div>
              )}
            </div>
            <Text size="xs" c="dimmed" ta="center" truncate>
              {field.label}
            </Text>
          </button>
        );
      })}
    </div>
  );
}
