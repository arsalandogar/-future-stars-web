import { create } from 'zustand';

import {
  type SvgJsonNode,
  type EditableFieldId,
  type EditableColorField,
  type EditableImageField,
  type EditableTextField,
  type Edits,
  applyTextEdit,
  applyImageEdit,
  getEditUrl,
  prepareTemplate,
  applyEdits,
  withColorEdit,
  withImageEdit,
  applyImageZoom,
  nudgeImageNodes,
  withZoomEdit,
  withNudgeEdit,
} from '@fs-card-engine';

export type Side = 'front' | 'back';

interface SideState {
  workingCopy: SvgJsonNode | null;
  editableFields: EditableTextField[];
  editableColorFields: EditableColorField[];
  editableImageFields: EditableImageField[];
  edits: Edits;
  revision: number;
  appliedPresetId: number | null;
  appliedPresetColors: string[] | null;
}

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

function createEmptySideState(): SideState {
  return {
    workingCopy: null,
    editableFields: [],
    editableColorFields: [],
    editableImageFields: [],
    edits: {},
    revision: 0,
    appliedPresetId: null,
    appliedPresetColors: null,
  };
}

/** Rebuild a side from SVG while re-applying matching editable state. */
function initializeSideSnapshot(svgNode: SvgJsonNode, previous: SideState) {
  const { workingCopy, fields } = prepareTemplate(svgNode);

  const preservedEdits: Edits = { ...previous.edits };
  applyEdits(fields, preservedEdits);

  return {
    workingCopy,
    editableFields: fields.textFields,
    editableColorFields: fields.colorFields,
    editableImageFields: fields.imageFields,
    edits: preservedEdits,
    revision: previous.revision + 1,
    appliedPresetId: previous.appliedPresetColors
      ? previous.appliedPresetId
      : null,
    appliedPresetColors: previous.appliedPresetColors,
  } as SideState;
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

export const useCardEditorStore = create<CardEditorState>()((set, get) => ({
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

    applyTextEdit(field, value);

    const newEdits = { ...sideState.edits };
    if (value === field.originalValue) {
      delete newEdits[fieldId];
    } else {
      newEdits[fieldId] = value;
    }

    set(commitSide(state, target, { edits: newEdits }));
  },

  updateColorField: (fieldId, color, side) => {
    const state = get();
    const [target, sideState] = getSide(state, side);
    const field = sideState.editableColorFields.find(
      (f) => f.fieldId === fieldId
    );
    if (!field) return;

    const newEdits = withColorEdit(sideState.edits, field, color);

    set(commitSide(state, target, { edits: newEdits, appliedPresetId: null }));
  },

  applyColorPreset: (colors, presetId, side) => {
    const state = get();
    const [target, sideState] = getSide(state, side);
    let newEdits = { ...sideState.edits };

    for (let i = 0; i < sideState.editableColorFields.length; i++) {
      const color =
        i < colors.length
          ? colors[i]
          : sideState.editableColorFields[i].originalValue;
      newEdits = withColorEdit(
        newEdits,
        sideState.editableColorFields[i],
        color
      );
    }

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

    const colorA =
      getEditUrl(sideState.edits[fieldIdA]) ?? fieldA.originalValue;
    const colorB =
      getEditUrl(sideState.edits[fieldIdB]) ?? fieldB.originalValue;

    let newEdits = { ...sideState.edits };
    newEdits = withColorEdit(newEdits, fieldA, colorB);
    newEdits = withColorEdit(newEdits, fieldB, colorA);

    set(commitSide(state, target, { edits: newEdits, appliedPresetId: null }));
  },

  resetAllColors: (side) => {
    const state = get();
    const [target, sideState] = getSide(state, side);
    let newEdits = { ...sideState.edits };

    for (const field of sideState.editableColorFields) {
      newEdits = withColorEdit(newEdits, field, field.originalValue);
    }

    set(
      commitSide(state, target, {
        edits: newEdits,
        appliedPresetId: null,
        appliedPresetColors: null,
      })
    );
  },

  resetToPreset: (side) => {
    const state = get();
    const [target, sideState] = getSide(state, side);
    let newEdits = { ...sideState.edits };

    for (let i = 0; i < sideState.editableColorFields.length; i++) {
      const field = sideState.editableColorFields[i];
      const targetColor =
        sideState.appliedPresetColors?.[i] ?? field.originalValue;
      newEdits = withColorEdit(newEdits, field, targetColor);
    }

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

    applyImageEdit(field, imageUrl);

    set(
      commitSide(state, target, {
        edits: withImageEdit(sideState.edits, field, fieldId, imageUrl),
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

    applyImageEdit(field, field.originalValue);

    const newEdits = { ...sideState.edits };
    delete newEdits[fieldId];

    set(commitSide(state, target, { edits: newEdits }));
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

    applyTextEdit(field, field.originalValue);

    const newEdits = { ...sideState.edits };
    delete newEdits[fieldId];

    set(commitSide(state, target, { edits: newEdits }));
  },

  setFocusedFieldId: (fieldId) => set({ focusedFieldId: fieldId }),

  reset: () => set(createInitialState()),
}));
