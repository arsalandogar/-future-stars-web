import { Fragment, useState } from 'react';
import {
  ActionIcon,
  ColorPicker,
  ColorSwatch,
  Popover,
  TextInput,
} from '@mantine/core';
import { useEyeDropper } from '@mantine/hooks';
import { ArrowLeftRight, Heart, Pipette, RotateCcw } from 'lucide-react';

import type { EditableFieldId } from '@/features/templates';

import { useCardEditorStore } from '../stores/card-editor-store';
import {
  useAddColorFavorite,
  useColorFavorites,
  useRemoveColorFavorite,
} from '../api/color-favorites';

import styles from './active-colors-bar.module.css';

const HEX_COLOR_REGEX = /^#[0-9a-fA-F]{6}$/;

function normalizeHex(raw: string): string | null {
  let val = raw.trim();
  if (!val.startsWith('#')) val = `#${val}`;
  return HEX_COLOR_REGEX.test(val) ? val.toLowerCase() : null;
}

interface ColorCircleProps {
  fieldId: EditableFieldId;
  originalColor: string;
  label: string;
}

function ColorCircle({ fieldId, originalColor, label }: ColorCircleProps) {
  const color = useCardEditorStore((s) => {
    const v = s.sides[s.activeSide].edits[fieldId];
    return typeof v === 'string' ? v : originalColor;
  });
  const [opened, setOpened] = useState(false);
  const [hexInput, setHexInput] = useState(color);
  const { supported, open } = useEyeDropper();
  const updateColorField = useCardEditorStore((s) => s.updateColorField);

  const handleOpen = (isOpen: boolean) => {
    setOpened(isOpen);
    if (isOpen) setHexInput(color);
  };

  const applyHexColor = (value: string) => {
    const normalized = normalizeHex(value);
    if (!normalized) return false;

    updateColorField(fieldId, normalized);
    setHexInput(normalized);
    return true;
  };

  const handlePickerChange = (value: string) => {
    // ColorPicker emits valid #rrggbb — skip normalizeHex on every drag tick.
    updateColorField(fieldId, value);
    setHexInput(value);
  };

  const handleHexChange = (raw: string) => {
    setHexInput(raw);
    const normalized = normalizeHex(raw);
    if (normalized) {
      updateColorField(fieldId, normalized);
    }
  };

  const commitHex = () => {
    if (!applyHexColor(hexInput)) {
      setHexInput(color);
    }
  };

  const handleEyeDropperPick = () => {
    void (async () => {
      try {
        const result = await open();
        if (result?.sRGBHex) applyHexColor(result.sRGBHex);
      } catch {
        // EyeDropper throws when the user cancels; keep the current color unchanged.
      }
    })();
  };

  return (
    <Popover
      opened={opened}
      onChange={handleOpen}
      position="bottom"
      shadow="md"
      withinPortal
    >
      <Popover.Target>
        <button
          type="button"
          className={styles.colorButton}
          onClick={() => handleOpen(!opened)}
          aria-label={`Edit ${label} color`}
        >
          <ColorSwatch color={color} size={32} />
        </button>
      </Popover.Target>
      <Popover.Dropdown p="sm" bg="#1a1f2e" bd="1px solid #2a3045">
        <ColorPicker
          value={color}
          onChange={handlePickerChange}
          format="hex"
          size="sm"
        />
        <div className="flex items-center gap-2 mt-(--mantine-spacing-xs)">
          <TextInput
            value={hexInput}
            onChange={(e) => handleHexChange(e.currentTarget.value)}
            onBlur={commitHex}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                e.stopPropagation();
                commitHex();
              }
            }}
            placeholder="#000000"
            size="xs"
            className="flex-1"
            styles={{
              input: {
                backgroundColor: '#0d1117',
                borderColor: '#2a3045',
                color: 'white',
                fontFamily: 'monospace',
                textAlign: 'center',
              },
            }}
          />
          {supported ? (
            <ActionIcon
              variant="default"
              size={30}
              onClick={handleEyeDropperPick}
              aria-label={`Pick ${label} color from screen`}
              title="Pick color from screen"
              style={{
                borderColor: '#2a3045',
                backgroundColor: '#111827',
                color: 'var(--mantine-color-gray-1)',
              }}
            >
              <Pipette size={15} />
            </ActionIcon>
          ) : null}
        </div>
      </Popover.Dropdown>
    </Popover>
  );
}

export function ActiveColorsBar() {
  const editableColorFields = useCardEditorStore(
    (s) => s.sides[s.activeSide].editableColorFields
  );
  const appliedPresetId = useCardEditorStore(
    (s) => s.sides[s.activeSide].appliedPresetId
  );
  const swapColors = useCardEditorStore((s) => s.swapColors);
  const resetToPreset = useCardEditorStore((s) => s.resetToPreset);

  const { data: favoritesData } = useColorFavorites();
  const addFavorite = useAddColorFavorite();
  const removeFavorite = useRemoveColorFavorite();

  const favorites = favoritesData?.data ?? [];
  const isFavorited = appliedPresetId
    ? favorites.some((f) => f.id === appliedPresetId)
    : false;

  const handleFavoriteToggle = () => {
    if (!appliedPresetId) return;

    if (isFavorited) {
      removeFavorite.mutate({ id: appliedPresetId });
    } else {
      addFavorite.mutate({ colorPaletteId: appliedPresetId });
    }
  };

  return (
    <div className={styles.bar}>
      <div className={styles.colors}>
        {editableColorFields.map((field, i) => (
          <Fragment key={field.fieldId}>
            {i > 0 && (
              <button
                type="button"
                className={styles.swapButton}
                onClick={() =>
                  swapColors(editableColorFields[i - 1].fieldId, field.fieldId)
                }
                aria-label={`Swap ${editableColorFields[i - 1].label} and ${field.label} colors`}
                title="Swap colors"
              >
                <ArrowLeftRight size={14} />
              </button>
            )}
            <ColorCircle
              fieldId={field.fieldId}
              originalColor={field.originalValue}
              label={field.label}
            />
          </Fragment>
        ))}
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.iconButton}
          onClick={() => resetToPreset()}
          aria-label="Reset colors"
          title="Reset colors"
        >
          <RotateCcw size={16} />
        </button>
        <button
          type="button"
          className={styles.iconButton}
          data-active={isFavorited || undefined}
          data-disabled={!appliedPresetId || undefined}
          disabled={!appliedPresetId}
          onClick={handleFavoriteToggle}
          aria-label={
            isFavorited ? 'Remove from favorites' : 'Add to favorites'
          }
          title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart size={16} fill={isFavorited ? 'currentColor' : 'none'} />
        </button>
      </div>
    </div>
  );
}
