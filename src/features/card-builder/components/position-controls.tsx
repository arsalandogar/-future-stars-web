import { Slider, Text } from '@mantine/core';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Minus,
  Plus,
} from 'lucide-react';

import styles from './position-controls.module.css';

interface PositionControlsProps {
  zoom: number;
  disabled: boolean;
  onZoomChange: (zoom: number) => void;
  onNudge: (direction: 'up' | 'down' | 'left' | 'right') => void;
}

export function PositionControls({
  zoom,
  disabled,
  onZoomChange,
  onNudge,
}: PositionControlsProps) {
  return (
    <div className={styles.container}>
      <div className={styles.section}>
        <Text size="sm" c="dimmed" mb="xs">
          Zoom
        </Text>
        <div className={styles.zoomRow}>
          <button
            type="button"
            className={styles.zoomButton}
            onClick={() => onZoomChange(Math.max(0.5, zoom - 0.05))}
            disabled={disabled}
            aria-label="Zoom out"
          >
            <Minus size={16} />
          </button>
          <Slider
            value={zoom}
            onChange={onZoomChange}
            min={0.5}
            max={2}
            step={0.01}
            label={null}
            className={styles.zoomSlider}
            color="primary.4"
            disabled={disabled}
          />
          <button
            type="button"
            className={styles.zoomButton}
            onClick={() => onZoomChange(Math.min(2, zoom + 0.05))}
            disabled={disabled}
            aria-label="Zoom in"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      <div className={styles.section}>
        <Text size="sm" c="dimmed" mb="xs">
          Position
        </Text>
        <div className={styles.dpad}>
          <button
            type="button"
            className={styles.dpadButton}
            data-direction="up"
            onClick={() => onNudge('up')}
            disabled={disabled}
            aria-label="Move up"
          >
            <ChevronUp size={20} />
          </button>
          <div className={styles.dpadMiddle}>
            <button
              type="button"
              className={styles.dpadButton}
              data-direction="left"
              onClick={() => onNudge('left')}
              disabled={disabled}
              aria-label="Move left"
            >
              <ChevronLeft size={20} />
            </button>
            <div className={styles.dpadCenter} />
            <button
              type="button"
              className={styles.dpadButton}
              data-direction="right"
              onClick={() => onNudge('right')}
              disabled={disabled}
              aria-label="Move right"
            >
              <ChevronRight size={20} />
            </button>
          </div>
          <button
            type="button"
            className={styles.dpadButton}
            data-direction="down"
            onClick={() => onNudge('down')}
            disabled={disabled}
            aria-label="Move down"
          >
            <ChevronDown size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
