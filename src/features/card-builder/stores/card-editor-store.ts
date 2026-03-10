import { create } from 'zustand';

import {
  type SvgJsonNode,
  type EditableFieldId,
  type Edits,
  type FontLookupResult,
  type Side,
  type SideState,
  createEmptySideState,
  initializeSideSnapshot,
  applyTextCompression,
  withColorEdit,
  withImageEdit,
  applyImageZoom,
  nudgeImageNodes,
  withZoomEdit,
  withNudgeEdit,
  withTextEdit,
  withPresetColors,
  withSwappedColors,
  withAllColorsReset,
  withImageRemoved,
  withTextFieldReset,
} from '@fs-card-engine';
import { ensureSvgFontsLoaded } from '../lib/ensure-svg-fonts-loaded';
import { resolveCardBuilderFont } from '../lib/font-resolver';
import {
  clearTextCompressionWarningCache,
  reportTextCompressionWarning,
} from '../lib/text-compression-warning-reporter';

interface CardEditorState {
  activeSide: Side;
  sides: Record<Side, SideState>;
  focusedFieldId: EditableFieldId | null;

  initializeSideFromSvg: (side: Side, svgNode: SvgJsonNode | undefined) => void;
  setActiveSide: (side: Side) => void;
  getEditsForSave: () => {
    frontEdits: Edits;
    backEdits: Edits;
  };
  updateTextField: (
    fieldId: EditableFieldId,
    value: string,
    side?: Side
  ) => void;
  updateColorField: (
    fieldId: EditableFieldId,
    color: string,
    side?: Side
  ) => void;
  updateImageField: (
    fieldId: EditableFieldId,
    imageUrl: string,
    side?: Side
  ) => void;
  removeImageField: (fieldId: EditableFieldId, side?: Side) => void;
  adjustImageZoom: (
    fieldId: EditableFieldId,
    zoom: number,
    offsetX: number,
    offsetY: number,
    side?: Side
  ) => void;
  nudgeImagePosition: (
    fieldId: EditableFieldId,
    dx: number,
    dy: number,
    side?: Side
  ) => void;
  applyColorPreset: (colors: string[], presetId: number, side?: Side) => void;
  swapColors: (
    fieldIdA: EditableFieldId,
    fieldIdB: EditableFieldId,
    side?: Side
  ) => void;
  resetAllColors: (side?: Side) => void;
  resetToPreset: (side?: Side) => void;
  resetField: (fieldId: EditableFieldId, side?: Side) => void;
  setFocusedFieldId: (fieldId: EditableFieldId | null) => void;
  reset: () => void;
}

/** Resolve the target side and return its state. */
function getSide(state: CardEditorState, side?: Side) {
  const target = side ?? state.activeSide;
  return [target, state.sides[target]] as const;
}

/** Build a partial state update that patches one side and bumps its revision. */
function commitSide(
  state: CardEditorState,
  side: Side,
  patch: Partial<SideState>
): { sides: Record<Side, SideState> } {
  const current = state.sides[side];
  return {
    sides: {
      ...state.sides,
      [side]: {
        ...current,
        ...patch,
        revision: current.revision + 1,
      },
    },
  };
}

function createInitialState() {
  return {
    activeSide: 'front' as Side,
    sides: {
      front: createEmptySideState(),
      back: createEmptySideState(),
    } satisfies Record<Side, SideState>,
    focusedFieldId: null as EditableFieldId | null,
  };
}

interface CompressionRunState {
  running: boolean;
  pending: boolean;
}

function createCompressionState(): Record<Side, CompressionRunState> {
  return {
    front: { running: false, pending: false },
    back: { running: false, pending: false },
  };
}

export const useCardEditorStore = create<CardEditorState>()((set, get) => {
  const compressionState = createCompressionState();
  const fontCache = new Map<string, Promise<FontLookupResult>>();

  const scheduleTextCompression = (side: Side): void => {
    const runState = compressionState[side];
    runState.pending = true;

    if (runState.running) return;

    runState.running = true;
    void (async () => {
      try {
        while (runState.pending) {
          runState.pending = false;

          const snapshot = get().sides[side];
          const workingCopy = snapshot.workingCopy;
          if (!workingCopy) continue;

          const startRevision = snapshot.revision;

          let result;
          try {
            result = await applyTextCompression(workingCopy, {
              fontResolver: resolveCardBuilderFont,
              fontCache,
              onWarning: (warning) => {
                reportTextCompressionWarning(side, warning);
              },
            });
          } catch {
            continue;
          }

          const latestSide = get().sides[side];
          if (latestSide.revision !== startRevision) {
            if (latestSide.workingCopy) runState.pending = true;
            continue;
          }

          if (result.modifiedCount > 0) {
            const latestState = get();
            set(commitSide(latestState, side, {}));
          }
        }
      } finally {
        runState.running = false;
        if (runState.pending) scheduleTextCompression(side);
      }
    })();
  };

  return {
    ...createInitialState(),

    initializeSideFromSvg: (side, svgNode) => {
      if (!svgNode) return;
      const state = get();
      const nextSide = initializeSideSnapshot(svgNode, state.sides[side]);
      set({
        sides: {
          ...state.sides,
          [side]: nextSide,
        },
      });
      void ensureSvgFontsLoaded(svgNode).then(() => {
        // Bump revision so React re-renders the SVG with the loaded font,
        // then re-run text compression against the correct glyph widths.
        const current = get();
        set(commitSide(current, side, {}));
        scheduleTextCompression(side);
      });
    },

    setActiveSide: (side) => {
      const state = get();
      if (side === state.activeSide) return;
      if (side === 'back' && state.sides.back.workingCopy === null) return;
      set({
        activeSide: side,
        focusedFieldId: null,
      });
    },

    getEditsForSave: () => {
      const state = get();
      const hasBackWorkingCopy = state.sides.back.workingCopy !== null;
      return {
        frontEdits: state.sides.front.edits,
        backEdits: hasBackWorkingCopy ? state.sides.back.edits : {},
      };
    },

    updateTextField: (fieldId, value, side) => {
      const state = get();
      const [target, sideState] = getSide(state, side);
      const field = sideState.editableFields.find((f) => f.fieldId === fieldId);
      if (!field) return;

      set(
        commitSide(state, target, {
          edits: withTextEdit(sideState.edits, field, value),
        })
      );
      scheduleTextCompression(target);
    },

    updateColorField: (fieldId, color, side) => {
      const state = get();
      const [target, sideState] = getSide(state, side);
      const field = sideState.editableColorFields.find(
        (f) => f.fieldId === fieldId
      );
      if (!field) return;

      const newEdits = withColorEdit(sideState.edits, field, color);

      set(
        commitSide(state, target, { edits: newEdits, appliedPresetId: null })
      );
    },

    applyColorPreset: (colors, presetId, side) => {
      const state = get();
      const [target, sideState] = getSide(state, side);
      const newEdits = withPresetColors(
        sideState.edits,
        sideState.editableColorFields,
        colors
      );

      set(
        commitSide(state, target, {
          edits: newEdits,
          appliedPresetId: presetId,
          appliedPresetColors: colors,
        })
      );
    },

    swapColors: (fieldIdA, fieldIdB, side) => {
      const state = get();
      const [target, sideState] = getSide(state, side);
      const fieldA = sideState.editableColorFields.find(
        (f) => f.fieldId === fieldIdA
      );
      const fieldB = sideState.editableColorFields.find(
        (f) => f.fieldId === fieldIdB
      );
      if (!fieldA || !fieldB) return;

      const newEdits = withSwappedColors(sideState.edits, fieldA, fieldB);

      set(
        commitSide(state, target, { edits: newEdits, appliedPresetId: null })
      );
    },

    resetAllColors: (side) => {
      const state = get();
      const [target, sideState] = getSide(state, side);

      set(
        commitSide(state, target, {
          edits: withAllColorsReset(
            sideState.edits,
            sideState.editableColorFields
          ),
          appliedPresetId: null,
          appliedPresetColors: null,
        })
      );
    },

    resetToPreset: (side) => {
      const state = get();
      const [target, sideState] = getSide(state, side);
      const newEdits = withPresetColors(
        sideState.edits,
        sideState.editableColorFields,
        sideState.appliedPresetColors ?? []
      );

      set(
        commitSide(state, target, {
          edits: newEdits,
          appliedPresetId: sideState.appliedPresetColors
            ? sideState.appliedPresetId
            : null,
        })
      );
    },

    updateImageField: (fieldId, imageUrl, side) => {
      const state = get();
      const [target, sideState] = getSide(state, side);
      const field = sideState.editableImageFields.find(
        (f) => f.fieldId === fieldId
      );
      if (!field) return;

      set(
        commitSide(state, target, {
          edits: withImageEdit(sideState.edits, field, imageUrl),
        })
      );
    },

    removeImageField: (fieldId, side) => {
      const state = get();
      const [target, sideState] = getSide(state, side);
      const field = sideState.editableImageFields.find(
        (f) => f.fieldId === fieldId
      );
      if (!field) return;

      set(
        commitSide(state, target, {
          edits: withImageRemoved(sideState.edits, field),
        })
      );
    },

    adjustImageZoom: (fieldId, zoom, offsetX, offsetY, side) => {
      const state = get();
      const [target, sideState] = getSide(state, side);
      const field = sideState.editableImageFields.find(
        (f) => f.fieldId === fieldId
      );
      if (!field) return;

      applyImageZoom(field.elementNodes, zoom, offsetX, offsetY);

      set(
        commitSide(state, target, {
          edits: withZoomEdit(sideState.edits, fieldId, zoom, offsetX, offsetY),
        })
      );
    },

    nudgeImagePosition: (fieldId, dx, dy, side) => {
      const state = get();
      const [target, sideState] = getSide(state, side);
      const field = sideState.editableImageFields.find(
        (f) => f.fieldId === fieldId
      );
      if (!field) return;

      nudgeImageNodes(field.elementNodes, dx, dy);

      set(
        commitSide(state, target, {
          edits: withNudgeEdit(sideState.edits, fieldId, dx, dy),
        })
      );
    },

    resetField: (fieldId, side) => {
      const state = get();
      const [target, sideState] = getSide(state, side);
      const field = sideState.editableFields.find((f) => f.fieldId === fieldId);
      if (!field) return;

      set(
        commitSide(state, target, {
          edits: withTextFieldReset(sideState.edits, field),
        })
      );
      scheduleTextCompression(target);
    },

    setFocusedFieldId: (fieldId) => set({ focusedFieldId: fieldId }),

    reset: () => {
      // Prevent stale compression loops from writing to the new state.
      compressionState.front = { running: false, pending: false };
      compressionState.back = { running: false, pending: false };
      clearTextCompressionWarningCache();
      set(createInitialState());
    },
  };
});
