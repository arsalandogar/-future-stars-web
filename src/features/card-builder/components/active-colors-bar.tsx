import { Fragment, useState } from 'react';
import {
  ActionIcon,
  ColorPicker,
  Popover,
  Text,
  TextInput,
} from '@mantine/core';
import { useEyeDropper } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import {
  ArrowLeft,
  ArrowLeftRight,
  Flame,
  Heart,
  Pipette,
  Plus,
  IterationCw,
  RotateCcw,
  X,
} from 'lucide-react';

import { useQueryClient } from '@tanstack/react-query';

import type { EditableFieldId } from '@/features/templates';
import {
  useAttachTemplatePalette,
  useCreateColorPalette,
  useDetachTemplatePalette,
} from '@/features/color-palettes';

import { useCardEditorStore } from '../stores/card-editor-store';
import {
  useAddColorFavorite,
  useColorFavorites,
  useRemoveColorFavorite,
} from '../api/color-favorites';
import { useTemplateColorPalettes } from '../api/template-color-palettes';
import { useIsTemplatePalette } from '../hooks/use-is-template-palette';
import { useImageColors } from '../hooks/use-image-colors';
import { readNodeFill } from '../utils/read-node-fill';

import styles from './active-colors-bar.module.css';

const HEX_COLOR_REGEX = /^#[0-9a-fA-F]{6}$/;

function normalizeHex(raw: string): string | null {
  let val = raw.trim();
  if (!val.startsWith('#')) val = `#${val}`;
  return HEX_COLOR_REGEX.test(val) ? val.toLowerCase() : null;
}

/* ── Visual circle for the top bar ── */

function CircleVisual({
  fieldId,
  originalColor,
}: {
  fieldId: EditableFieldId;
  originalColor: string;
}) {
  const bgColor = useCardEditorStore((s) => {
    const v = s.sides[s.activeSide].edits[fieldId];
    return typeof v === 'string' ? v : originalColor;
  });

  const fgColor = useCardEditorStore((s) => {
    const side = s.sides[s.activeSide];
    for (const field of side.editableFields) {
      if (field.textColorArea !== fieldId) continue;
      const node = field.elementNodes[0];
      if (!node) continue;
      return readNodeFill(node);
    }
    if (side.appliedPresetColors) {
      const idx = side.editableColorFields.findIndex(
        (f) => f.fieldId === fieldId
      );
      if (idx >= 0 && idx < side.appliedPresetColors.length) {
        return side.appliedPresetColors[idx].fg;
      }
    }
    return null;
  });

  return (
    <div className={styles.colorCircle} style={{ backgroundColor: bgColor }}>
      {fgColor && (
        <span className={styles.fgText} style={{ color: fgColor }}>
          Tt
        </span>
      )}
    </div>
  );
}

/* ── BG color circle in popover ── */

function BgFieldCircle({
  fieldId,
  originalColor,
  selected,
  onClick,
}: {
  fieldId: EditableFieldId;
  originalColor: string;
  selected: boolean;
  onClick: () => void;
}) {
  const bgColor = useCardEditorStore((s) => {
    const v = s.sides[s.activeSide].edits[fieldId];
    return typeof v === 'string' ? v : originalColor;
  });

  return (
    <button
      type="button"
      className={styles.popoverCircle}
      data-selected={selected || undefined}
      onClick={onClick}
    >
      <div
        className={styles.popoverCircleInner}
        style={{ backgroundColor: bgColor }}
      />
    </button>
  );
}

/* ── FG color circle in popover ── */

function FgFieldCircle({
  fieldId,
  selected,
  onClick,
}: {
  fieldId: EditableFieldId;
  selected: boolean;
  onClick: () => void;
}) {
  const fgColor = useCardEditorStore((s) => {
    const side = s.sides[s.activeSide];
    for (const field of side.editableFields) {
      if (field.textColorArea !== fieldId) continue;
      const node = field.elementNodes[0];
      if (!node) continue;
      return readNodeFill(node);
    }
    if (side.appliedPresetColors) {
      const idx = side.editableColorFields.findIndex(
        (f) => f.fieldId === fieldId
      );
      if (idx >= 0 && idx < side.appliedPresetColors.length) {
        return side.appliedPresetColors[idx].fg;
      }
    }
    return null;
  });

  if (!fgColor) return null;

  return (
    <button
      type="button"
      className={styles.popoverCircle}
      data-selected={selected || undefined}
      onClick={onClick}
    >
      <div
        className={styles.popoverCircleInner}
        style={{ backgroundColor: fgColor }}
      />
    </button>
  );
}

/* ── Per-field color options view (BACKGROUND + TEXT rows) ── */

interface FieldColorOptionsViewProps {
  targetFieldId: EditableFieldId;
  onOpenBgPicker: () => void;
  onOpenFgPicker: () => void;
}

function FieldColorOptionsView({
  targetFieldId,
  onOpenBgPicker,
  onOpenFgPicker,
}: FieldColorOptionsViewProps) {
  const editableColorFields = useCardEditorStore(
    (s) => s.sides[s.activeSide].editableColorFields
  );
  const hasTextForField = useCardEditorStore((s) =>
    s.sides[s.activeSide].editableFields.some(
      (f) => f.textColorArea === targetFieldId
    )
  );
  const updateColorField = useCardEditorStore((s) => s.updateColorField);
  const updateTextColorForArea = useCardEditorStore(
    (s) => s.updateTextColorForArea
  );
  const { colors: imageColors } = useImageColors();

  const otherFields = editableColorFields.filter(
    (f) => f.fieldId !== targetFieldId
  );
  const targetField = editableColorFields.find(
    (f) => f.fieldId === targetFieldId
  );

  return (
    <div>
      <div className={styles.sectionLabel}>Background</div>
      <div className={styles.colorRow}>
        <button
          type="button"
          className={styles.addButton}
          onClick={onOpenBgPicker}
        >
          <Plus size={18} />
        </button>
        {targetField && (
          <BgFieldCircle
            fieldId={targetField.fieldId}
            originalColor={targetField.originalValue}
            selected
            onClick={onOpenBgPicker}
          />
        )}
        {otherFields.map((field) => (
          <BgOptionCircle
            key={field.fieldId}
            sourceFieldId={field.fieldId}
            sourceOriginalColor={field.originalValue}
            targetFieldId={targetFieldId}
            onApply={updateColorField}
          />
        ))}
        {imageColors.map((color) => (
          <button
            key={`bg-img-${color}`}
            type="button"
            className={styles.imageColorCircle}
            onClick={() => updateColorField(targetFieldId, color)}
          >
            <div
              className={styles.popoverCircleInner}
              style={{ backgroundColor: color }}
            />
          </button>
        ))}
      </div>
      {hasTextForField && (
        <>
          <div className={styles.sectionLabel}>Text</div>
          <div className={styles.colorRow}>
            <button
              type="button"
              className={styles.addButton}
              onClick={onOpenFgPicker}
            >
              <Plus size={18} />
            </button>
            <FgFieldCircle
              fieldId={targetFieldId}
              selected
              onClick={onOpenFgPicker}
            />
            {otherFields.map((field) => (
              <FgOptionCircle
                key={field.fieldId}
                sourceFieldId={field.fieldId}
                targetFieldId={targetFieldId}
                onApply={updateTextColorForArea}
              />
            ))}
            {imageColors.map((color) => (
              <button
                key={`fg-img-${color}`}
                type="button"
                className={styles.imageColorCircle}
                onClick={() => updateTextColorForArea(targetFieldId, color)}
              >
                <div
                  className={styles.popoverCircleInner}
                  style={{ backgroundColor: color }}
                />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ── Option circles for picking from other palette items ── */

function BgOptionCircle({
  sourceFieldId,
  sourceOriginalColor,
  targetFieldId,
  onApply,
}: {
  sourceFieldId: EditableFieldId;
  sourceOriginalColor: string;
  targetFieldId: EditableFieldId;
  onApply: (fieldId: EditableFieldId, color: string) => void;
}) {
  const bgColor = useCardEditorStore((s) => {
    const v = s.sides[s.activeSide].edits[sourceFieldId];
    return typeof v === 'string' ? v : sourceOriginalColor;
  });

  return (
    <button
      type="button"
      className={styles.popoverCircle}
      onClick={() => onApply(targetFieldId, bgColor)}
    >
      <div
        className={styles.popoverCircleInner}
        style={{ backgroundColor: bgColor }}
      />
    </button>
  );
}

function FgOptionCircle({
  sourceFieldId,
  targetFieldId,
  onApply,
}: {
  sourceFieldId: EditableFieldId;
  targetFieldId: EditableFieldId;
  onApply: (fieldId: EditableFieldId, color: string) => void;
}) {
  const fgColor = useCardEditorStore((s) => {
    const side = s.sides[s.activeSide];
    for (const field of side.editableFields) {
      if (field.textColorArea !== sourceFieldId) continue;
      const node = field.elementNodes[0];
      if (!node) continue;
      return readNodeFill(node);
    }
    if (side.appliedPresetColors) {
      const idx = side.editableColorFields.findIndex(
        (f) => f.fieldId === sourceFieldId
      );
      if (idx >= 0 && idx < side.appliedPresetColors.length) {
        return side.appliedPresetColors[idx].fg;
      }
    }
    return null;
  });

  if (!fgColor) return null;

  return (
    <button
      type="button"
      className={styles.popoverCircle}
      onClick={() => onApply(targetFieldId, fgColor)}
    >
      <div
        className={styles.popoverCircleInner}
        style={{ backgroundColor: fgColor }}
      />
    </button>
  );
}

/* ── Picker content (gradient + hex + eye dropper) ── */

interface PickerContentProps {
  fieldId: EditableFieldId;
  originalColor: string;
  mode: 'bg' | 'fg';
  onBack: () => void;
}

function PickerContent({
  fieldId,
  originalColor,
  mode,
  onBack,
}: PickerContentProps) {
  const activeColor = useCardEditorStore((s) => {
    if (mode === 'bg') {
      const v = s.sides[s.activeSide].edits[fieldId];
      return typeof v === 'string' ? v : originalColor;
    }
    const side = s.sides[s.activeSide];
    for (const field of side.editableFields) {
      if (field.textColorArea !== fieldId) continue;
      const node = field.elementNodes[0];
      if (!node) continue;
      const fill = readNodeFill(node);
      if (fill) return fill;
    }
    if (side.appliedPresetColors) {
      const idx = side.editableColorFields.findIndex(
        (f) => f.fieldId === fieldId
      );
      if (idx >= 0 && idx < side.appliedPresetColors.length) {
        return side.appliedPresetColors[idx].fg;
      }
    }
    return '#000000';
  });

  const [hexInput, setHexInput] = useState(activeColor);
  const { supported, open } = useEyeDropper();
  const updateColorField = useCardEditorStore((s) => s.updateColorField);
  const updateTextColorForArea = useCardEditorStore(
    (s) => s.updateTextColorForArea
  );

  const applyColor = (value: string) => {
    if (mode === 'fg') {
      updateTextColorForArea(fieldId, value);
    } else {
      updateColorField(fieldId, value);
    }
  };

  const handlePickerChange = (value: string) => {
    applyColor(value);
    setHexInput(value);
  };

  const handleHexChange = (raw: string) => {
    setHexInput(raw);
    const normalized = normalizeHex(raw);
    if (normalized) applyColor(normalized);
  };

  const commitHex = () => {
    const normalized = normalizeHex(hexInput);
    if (normalized) {
      applyColor(normalized);
      setHexInput(normalized);
    } else {
      setHexInput(activeColor);
    }
  };

  const handleEyeDropperPick = async () => {
    try {
      const result = await open();
      if (result?.sRGBHex) {
        const normalized = normalizeHex(result.sRGBHex);
        if (normalized) {
          applyColor(normalized);
          setHexInput(normalized);
        }
      }
    } catch {
      // User cancelled
    }
  };

  return (
    <>
      <button type="button" className={styles.backButton} onClick={onBack}>
        <ArrowLeft size={14} />
        {mode === 'bg' ? 'Background' : 'Text'}
      </button>
      <ColorPicker
        value={activeColor}
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
            onClick={() => void handleEyeDropperPick()}
            aria-label="Pick color from screen"
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
    </>
  );
}

/* ── Main component ── */

export function ActiveColorsBar() {
  const editableColorFields = useCardEditorStore(
    (s) => s.sides[s.activeSide].editableColorFields
  );
  const appliedPresetId = useCardEditorStore(
    (s) => s.sides[s.activeSide].appliedPresetId
  );
  const swapColors = useCardEditorStore((s) => s.swapColors);
  const rotateColors = useCardEditorStore((s) => s.rotateColors);
  const resetToPreset = useCardEditorStore((s) => s.resetToPreset);

  const { data: favoritesData } = useColorFavorites();
  const addFavorite = useAddColorFavorite();
  const removeFavorite = useRemoveColorFavorite();

  const {
    templateDefaultsId,
    appliedPresetId: flamePaletteId,
    isPopular,
    matchingPaletteId,
    currentColorPairs,
  } = useIsTemplatePalette();
  const queryClient = useQueryClient();
  const attachPalette = useAttachTemplatePalette();
  const detachPalette = useDetachTemplatePalette();
  const createPalette = useCreateColorPalette();

  const favorites = favoritesData?.data ?? [];
  const isFavorited = appliedPresetId
    ? favorites.some((f) => f.id === appliedPresetId)
    : false;

  // Popover state
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [selectedFieldId, setSelectedFieldId] =
    useState<EditableFieldId | null>(null);
  const [pickerMode, setPickerMode] = useState<'bg' | 'fg' | null>(null);

  const handleCircleClick = (fieldId: EditableFieldId) => {
    if (popoverOpen && selectedFieldId === fieldId) {
      // Same circle clicked again → close popover
      setPopoverOpen(false);
    } else {
      // Open/switch to this field's options
      setSelectedFieldId(fieldId);
      setPickerMode(null);
      setPopoverOpen(true);
    }
  };

  const handlePopoverChange = (opened: boolean) => {
    setPopoverOpen(opened);
    if (!opened) {
      setPickerMode(null);
    }
  };

  const handleFavoriteToggle = () => {
    if (!appliedPresetId) return;

    if (isFavorited) {
      removeFavorite.mutate({ id: appliedPresetId });
    } else {
      addFavorite.mutate({ colorPaletteId: appliedPresetId });
    }
  };

  const invalidateTemplatePalettes = () => {
    void queryClient.invalidateQueries({
      queryKey: useTemplateColorPalettes.getKey(),
    });
  };

  const handleFlameToggle = () => {
    if (!templateDefaultsId || currentColorPairs.length === 0) return;

    if (isPopular && matchingPaletteId) {
      modals.openConfirmModal({
        title: <Text fw={700}>Remove from Popular</Text>,
        centered: true,
        children: (
          <Text size="sm">
            This will remove the color palette from this template&apos;s popular
            colors.
          </Text>
        ),
        labels: { confirm: 'Remove', cancel: 'Cancel' },
        confirmProps: { color: 'orange' },
        onConfirm: () => {
          detachPalette.mutate(
            {
              paletteId: matchingPaletteId,
              templateId: templateDefaultsId,
            },
            { onSuccess: invalidateTemplatePalettes }
          );
        },
      });
    } else if (flamePaletteId) {
      attachPalette.mutate(
        {
          paletteId: flamePaletteId,
          templateId: templateDefaultsId,
        },
        { onSuccess: invalidateTemplatePalettes }
      );
    } else {
      createPalette.mutate(
        {
          name: 'Custom',
          colorPairs: currentColorPairs.map((c, i) => ({
            bg: c.bg,
            fg: c.fg,
            rank: i,
          })),
          isActive: true,
        },
        {
          onSuccess: (result) => {
            const paletteId = result.id;
            if (!paletteId) return;
            attachPalette.mutate(
              {
                paletteId,
                templateId: templateDefaultsId,
              },
              { onSuccess: invalidateTemplatePalettes }
            );
          },
        }
      );
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
            <Popover
              opened={popoverOpen && selectedFieldId === field.fieldId}
              onChange={(opened) => {
                if (!opened) handlePopoverChange(false);
              }}
              position="bottom"
              shadow="md"
              withinPortal
              closeOnClickOutside={false}
              withArrow
              arrowSize={10}
              classNames={{ arrow: styles.popoverArrow }}
            >
              <Popover.Target>
                <button
                  type="button"
                  className={styles.colorButton}
                  onClick={() => handleCircleClick(field.fieldId)}
                  aria-label={`Edit ${field.label} color`}
                >
                  <CircleVisual
                    fieldId={field.fieldId}
                    originalColor={field.originalValue}
                  />
                </button>
              </Popover.Target>
              <Popover.Dropdown p="sm" bg="#1a1f2e" bd="1px solid #2a3045">
                <div style={{ position: 'relative' }}>
                  <button
                    type="button"
                    className={styles.closeButton}
                    onClick={() => setPopoverOpen(false)}
                    aria-label="Close"
                  >
                    <X size={14} />
                  </button>
                </div>
                <FieldColorOptionsView
                  targetFieldId={field.fieldId}
                  onOpenBgPicker={() => setPickerMode('bg')}
                  onOpenFgPicker={() => setPickerMode('fg')}
                />
                {pickerMode != null && (
                  <PickerContent
                    fieldId={field.fieldId}
                    originalColor={field.originalValue}
                    mode={pickerMode}
                    onBack={() => setPickerMode(null)}
                  />
                )}
              </Popover.Dropdown>
            </Popover>
          </Fragment>
        ))}
        {editableColorFields.length > 1 && (
          <button
            type="button"
            className={styles.swapButton}
            onClick={() => rotateColors()}
            aria-label="Rotate colors"
            title="Rotate colors"
          >
            <IterationCw size={14} />
          </button>
        )}
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
        {templateDefaultsId != null && (
          <button
            type="button"
            className={styles.iconButton}
            data-active-flame={isPopular || undefined}
            onClick={handleFlameToggle}
            aria-label={isPopular ? 'Remove from popular' : 'Add to popular'}
            title={isPopular ? 'Remove from popular' : 'Add to popular'}
          >
            <Flame size={16} fill={isPopular ? 'currentColor' : 'none'} />
          </button>
        )}
      </div>
    </div>
  );
}
