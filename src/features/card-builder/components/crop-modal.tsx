import { useCallback, useState } from 'react';
import Cropper from 'react-easy-crop';
import type { Area } from 'react-easy-crop';
import { Button, Group, Modal, Slider, Stack } from '@mantine/core';
import { Minus, Plus } from 'lucide-react';

import { getCroppedImageBlob } from '../utils/crop-image';

import styles from './crop-modal.module.css';

interface CropModalProps {
  imageSrc: string;
  aspectRatio: number | null;
  onConfirm: (blob: Blob) => void;
  onClose: () => void;
}

export function CropModal({
  imageSrc,
  aspectRatio,
  onConfirm,
  onClose,
}: CropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleConfirm = () => {
    if (!croppedAreaPixels) return;

    setIsProcessing(true);
    void getCroppedImageBlob(imageSrc, croppedAreaPixels)
      .then(onConfirm)
      .finally(() => setIsProcessing(false));
  };

  return (
    <Modal
      opened
      onClose={onClose}
      title="Crop Image"
      size="lg"
      centered
      styles={{
        content: { backgroundColor: '#151a26' },
        header: { backgroundColor: '#151a26', color: 'white' },
        title: { color: 'white' },
      }}
    >
      <Stack gap="md">
        <div className={styles.cropContainer}>
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspectRatio ?? undefined}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            style={{
              containerStyle: { borderRadius: 'var(--mantine-radius-sm)' },
            }}
          />
        </div>

        <div className={styles.zoomRow}>
          <button
            type="button"
            className={styles.zoomButton}
            onClick={() => setZoom((z) => Math.max(1, z - 0.1))}
            aria-label="Zoom out"
          >
            <Minus size={16} />
          </button>
          <Slider
            value={zoom}
            onChange={setZoom}
            min={1}
            max={3}
            step={0.01}
            label={null}
            className={styles.zoomSlider}
            color="primary.4"
          />
          <button
            type="button"
            className={styles.zoomButton}
            onClick={() => setZoom((z) => Math.min(3, z + 0.1))}
            aria-label="Zoom in"
          >
            <Plus size={16} />
          </button>
        </div>

        <Group justify="flex-end" gap="sm">
          <Button variant="subtle" color="gray" onClick={onClose}>
            Cancel
          </Button>
          <Button
            color="primary.4"
            onClick={handleConfirm}
            loading={isProcessing}
          >
            Confirm
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
