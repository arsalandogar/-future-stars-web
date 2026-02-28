import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { ImageIcon } from 'lucide-react';

import { ContentTabs, type ContentTabItem } from '@/components/ui/content-tabs';

import { useUploadCardImage } from '../api/upload-card-image';
import { useCardBuilderStore } from '../stores/card-builder-store';
import { useCardEditorStore } from '../stores/card-editor-store';
import {
  DEFAULT_IMAGE_POSITION,
  type EditValue,
  getEditUrl,
  isImageEdit,
} from '@future-stars/card-engine';
import { useImageUploadStore } from '../stores/image-upload-store';
import type { PhotoSubTab } from '../types';
import { ImageActions } from './image-actions';
import { ImageFieldsList } from './image-fields-list';
import { PositionControls } from './position-controls';
import { TabEmptyState } from './tab-empty-state';

import photoStyles from './photo-tab.module.css';
import styles from './tab-panel.module.css';

const CropModal = lazy(() =>
  import('./crop-modal').then((m) => ({ default: m.CropModal }))
);

const SUB_TAB_ITEMS: ContentTabItem[] = [
  { label: 'Image', value: 'image' },
  { label: 'Position', value: 'position' },
];

const NUDGE_STEP = 5;

const NUDGE_DELTAS: Record<string, [dx: number, dy: number]> = {
  left: [-NUDGE_STEP, 0],
  right: [NUDGE_STEP, 0],
  up: [0, -NUDGE_STEP],
  down: [0, NUDGE_STEP],
};

export function PhotoTab() {
  const editableImageFields = useCardEditorStore((s) => s.editableImageFields);
  const updateImageField = useCardEditorStore((s) => s.updateImageField);
  const removeImageField = useCardEditorStore((s) => s.removeImageField);
  const adjustImageZoom = useCardEditorStore((s) => s.adjustImageZoom);
  const nudgeImagePosition = useCardEditorStore((s) => s.nudgeImagePosition);

  const activePhotoSubTab = useCardBuilderStore((s) => s.activePhotoSubTab);
  const setActivePhotoSubTab = useCardBuilderStore(
    (s) => s.setActivePhotoSubTab
  );
  const selectedImageFieldId = useCardBuilderStore(
    (s) => s.selectedImageFieldId
  );
  const setSelectedImageFieldId = useCardBuilderStore(
    (s) => s.setSelectedImageFieldId
  );

  const addUpload = useImageUploadStore((s) => s.addUpload);
  const setUploadSuccess = useImageUploadStore((s) => s.setUploadSuccess);
  const setUploadError = useImageUploadStore((s) => s.setUploadError);
  const removeUpload = useImageUploadStore((s) => s.removeUpload);

  const uploadMutation = useUploadCardImage();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const rawFileUrlRef = useRef<string | null>(null);

  // Auto-select first image field if none selected
  useEffect(() => {
    if (!selectedImageFieldId && editableImageFields.length > 0) {
      setSelectedImageFieldId(editableImageFields[0].fieldId);
    }
  }, [editableImageFields, selectedImageFieldId, setSelectedImageFieldId]);

  const selectedField = editableImageFields.find(
    (f) => f.fieldId === selectedImageFieldId
  );

  const selectedEdit: EditValue | undefined = useCardEditorStore((s) =>
    selectedImageFieldId ? s.edits[selectedImageFieldId] : undefined
  );
  const currentUrl = selectedField
    ? (getEditUrl(selectedEdit) ?? selectedField.originalValue)
    : '';
  const hasImage = Boolean(
    currentUrl && currentUrl !== selectedField?.originalValue
  );

  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (rawFileUrlRef.current) {
        URL.revokeObjectURL(rawFileUrlRef.current);
      }
      const url = URL.createObjectURL(file);
      rawFileUrlRef.current = url;
      setCropSrc(url);

      // Reset file input so the same file can be re-selected
      e.target.value = '';
    },
    []
  );

  const handleCropConfirm = useCallback(
    (blob: Blob) => {
      if (!selectedImageFieldId) return;

      if (rawFileUrlRef.current) {
        URL.revokeObjectURL(rawFileUrlRef.current);
        rawFileUrlRef.current = null;
      }
      setCropSrc(null);

      // Create local preview
      const previewUrl = URL.createObjectURL(blob);

      // Store upload entry and apply local preview
      addUpload(selectedImageFieldId, previewUrl);
      updateImageField(selectedImageFieldId, previewUrl);

      // Upload in background
      const fieldId = selectedImageFieldId;
      uploadMutation.mutate(
        { image: blob, name: `card-${fieldId}`, category: 'user-card' },
        {
          onSuccess: (cdnUrl) => {
            setUploadSuccess(fieldId, cdnUrl);
            updateImageField(fieldId, cdnUrl);
          },
          onError: (error) => {
            setUploadError(
              fieldId,
              error instanceof Error ? error.message : 'Upload failed'
            );
          },
        }
      );
    },
    [
      selectedImageFieldId,
      addUpload,
      updateImageField,
      uploadMutation,
      setUploadSuccess,
      setUploadError,
    ]
  );

  const handleCropClose = useCallback(() => {
    if (rawFileUrlRef.current) {
      URL.revokeObjectURL(rawFileUrlRef.current);
      rawFileUrlRef.current = null;
    }
    setCropSrc(null);
  }, []);

  const handleRecrop = useCallback(() => {
    if (!selectedField || !currentUrl) return;
    if (rawFileUrlRef.current) {
      URL.revokeObjectURL(rawFileUrlRef.current);
    }
    rawFileUrlRef.current = null;
    setCropSrc(currentUrl);
  }, [selectedField, currentUrl]);

  const handleDelete = useCallback(() => {
    if (!selectedImageFieldId) return;
    removeImageField(selectedImageFieldId);
    removeUpload(selectedImageFieldId);
  }, [selectedImageFieldId, removeImageField, removeUpload]);

  const handleZoomChange = useCallback(
    (zoom: number) => {
      if (!selectedImageFieldId) return;

      const edit = useCardEditorStore.getState().edits[selectedImageFieldId];
      const pos = isImageEdit(edit) ? edit : DEFAULT_IMAGE_POSITION;
      adjustImageZoom(selectedImageFieldId, zoom, pos.offsetX, pos.offsetY);
    },
    [selectedImageFieldId, adjustImageZoom]
  );

  const handleNudge = useCallback(
    (direction: 'up' | 'down' | 'left' | 'right') => {
      if (!selectedImageFieldId) return;
      const [dx, dy] = NUDGE_DELTAS[direction];
      nudgeImagePosition(selectedImageFieldId, dx, dy);
    },
    [selectedImageFieldId, nudgeImagePosition]
  );

  if (editableImageFields.length === 0) {
    return (
      <div className={styles.container}>
        <TabEmptyState
          icon={<ImageIcon size={40} />}
          message="Select a template to upload photos"
        />
      </div>
    );
  }

  const currentZoom = isImageEdit(selectedEdit) ? selectedEdit.zoom : 1;

  return (
    <div className={styles.container}>
      <ImageFieldsList />

      <div className={photoStyles.subTabs}>
        <ContentTabs
          items={SUB_TAB_ITEMS}
          activeValue={activePhotoSubTab}
          onChange={(value) => setActivePhotoSubTab(value as PhotoSubTab)}
          size="sm"
        />
      </div>

      {activePhotoSubTab === 'image' && (
        <ImageActions
          hasImage={hasImage}
          disabled={!selectedField}
          onUpload={handleUploadClick}
          onRecrop={handleRecrop}
          onDelete={handleDelete}
        />
      )}

      {activePhotoSubTab === 'position' && (
        <PositionControls
          zoom={currentZoom}
          disabled={!selectedField || !hasImage}
          onZoomChange={handleZoomChange}
          onNudge={handleNudge}
        />
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className={photoStyles.hiddenInput}
        onChange={handleFileChange}
      />

      {cropSrc && selectedField && (
        <Suspense>
          <CropModal
            imageSrc={cropSrc}
            aspectRatio={selectedField.aspectRatio}
            onConfirm={handleCropConfirm}
            onClose={handleCropClose}
          />
        </Suspense>
      )}
    </div>
  );
}
