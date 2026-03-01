import { create } from 'zustand';

import {
  type SvgJsonNode,
  type EditableFieldId,
  type EditValue,
  type EditableColorField,
  type EditableImageField,
  type EditableTextField,
  applyColorEdit,
  applyImageEdit,
  applyTextEdit,
  discoverEditableColorFields,
  discoverEditableImageFields,
  discoverEditableTextFields,
  isImageEdit,
  getEditUrl,
  DEFAULT_IMAGE_POSITION,
} from '@fs-card-engine';
import { cloneWithStableIds } from '@/utils/svg-tree';

export type Side = 'front' | 'back';

type Edits = Partial<Record<EditableFieldId, EditValue>>;

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

/** Apply a color to the SVG node and update the edits record accordingly. */
function setColorEdit(
  edits: Edits,
  field: EditableColorField,
  color: string
): void {
  applyColorEdit(field, color);
  if (color === field.originalValue) {
    delete edits[field.fieldId];
  } else {
    edits[field.fieldId] = color;
  }
}

/** Parse an SVG node into a cloned working copy and its discovered editable fields. */
function parseSvgTemplate(svgNode: SvgJsonNode) {
  const workingCopy = cloneWithStableIds(svgNode);
  return {
    workingCopy,
    editableFields: discoverEditableTextFields(workingCopy),
    editableColorFields: discoverEditableColorFields(workingCopy),
    editableImageFields: discoverEditableImageFields(workingCopy),
  };
}

function nextImageEdits(
  edits: Edits,
  field: EditableImageField,
  fieldId: EditableFieldId,
  imageUrl: string
): Edits {
  const newEdits = { ...edits };
  if (imageUrl === field.originalValue) {
    delete newEdits[fieldId];
  } else {
    // Preserve existing position if just swapping URLs (e.g. local -> CDN)
    const prev = edits[fieldId];
    const position = isImageEdit(prev) ? prev : DEFAULT_IMAGE_POSITION;
    newEdits[fieldId] = { ...position, url: imageUrl };
  }
  return newEdits;
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
  const {
    workingCopy,
    editableFields,
    editableColorFields,
    editableImageFields,
  } = parseSvgTemplate(svgNode);

  // Keep all previous edits in store state and re-apply only the edits
  // that map to fields present in the current template snapshot.
  const preservedEdits: Edits = { ...previous.edits };

  // Re-apply preserved text edits to the new working copy.
  for (const field of editableFields) {
    const editedValue = preservedEdits[field.fieldId];
    if (typeof editedValue === 'string') {
      applyTextEdit(field, editedValue);
    }
  }

  // Re-apply matching direct color edits by field id.
  for (const field of editableColorFields) {
    const editedValue = preservedEdits[field.fieldId];
    if (typeof editedValue === 'string') {
      applyColorEdit(field, editedValue);
    }
  }

  // Re-apply preserved image edits to the new working copy.
  for (const imageField of editableImageFields) {
    const editedValue = preservedEdits[imageField.fieldId];
    const url = getEditUrl(editedValue);
    if (url) {
      applyImageEdit(imageField, url);
    }
  }

  return {
    workingCopy,
    editableFields,
    editableColorFields,
    editableImageFields,
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

    const newEdits = { ...sideState.edits };
    setColorEdit(newEdits, field, color);

    set(commitSide(state, target, { edits: newEdits, appliedPresetId: null }));
  },

  applyColorPreset: (colors, presetId, side) => {
    const state = get();
    const [target, sideState] = getSide(state, side);
    const newEdits = { ...sideState.edits };

    for (let i = 0; i < sideState.editableColorFields.length; i++) {
      const color =
        i < colors.length
          ? colors[i]
          : sideState.editableColorFields[i].originalValue;
      setColorEdit(newEdits, sideState.editableColorFields[i], color);
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

    const newEdits = { ...sideState.edits };
    setColorEdit(newEdits, fieldA, colorB);
    setColorEdit(newEdits, fieldB, colorA);

    set(commitSide(state, target, { edits: newEdits, appliedPresetId: null }));
  },

  resetAllColors: (side) => {
    const state = get();
    const [target, sideState] = getSide(state, side);
    const newEdits = { ...sideState.edits };

    for (const field of sideState.editableColorFields) {
      setColorEdit(newEdits, field, field.originalValue);
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
    const newEdits = { ...sideState.edits };

    for (let i = 0; i < sideState.editableColorFields.length; i++) {
      const field = sideState.editableColorFields[i];
      const targetColor =
        sideState.appliedPresetColors?.[i] ?? field.originalValue;
      setColorEdit(newEdits, field, targetColor);
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
        edits: nextImageEdits(sideState.edits, field, fieldId, imageUrl),
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

    for (const node of field.elementNodes) {
      // Store original dimensions on first use
      if (!node.attributes['data-orig-width']) {
        node.attributes['data-orig-width'] = node.attributes.width;
        node.attributes['data-orig-height'] = node.attributes.height;
        node.attributes['data-orig-x'] = node.attributes.x ?? '0';
        node.attributes['data-orig-y'] = node.attributes.y ?? '0';
      }

      const origW = parseFloat(node.attributes['data-orig-width']);
      const origH = parseFloat(node.attributes['data-orig-height']);
      const origX = parseFloat(node.attributes['data-orig-x']);
      const origY = parseFloat(node.attributes['data-orig-y']);

      const newW = origW * zoom;
      const newH = origH * zoom;
      node.attributes.width = String(newW);
      node.attributes.height = String(newH);
      node.attributes.x = String(origX - (newW - origW) / 2 + offsetX);
      node.attributes.y = String(origY - (newH - origH) / 2 + offsetY);
    }

    // Update position in the image edit entry
    const prev = sideState.edits[fieldId];
    const url = getEditUrl(prev) ?? '';
    const newEdits = { ...sideState.edits };
    if (url) {
      newEdits[fieldId] = { url, zoom, offsetX, offsetY };
    }

    set(commitSide(state, target, { edits: newEdits }));
  },

  nudgeImagePosition: (fieldId, dx, dy, side) => {
    const state = get();
    const [target, sideState] = getSide(state, side);
    const field = sideState.editableImageFields.find(
      (f) => f.fieldId === fieldId
    );
    if (!field) return;

    for (const node of field.elementNodes) {
      const curX = parseFloat(node.attributes.x ?? '0');
      const curY = parseFloat(node.attributes.y ?? '0');
      node.attributes.x = String(curX + dx);
      node.attributes.y = String(curY + dy);
    }

    // Update position in the image edit entry
    const prev = sideState.edits[fieldId];
    const url = getEditUrl(prev) ?? '';
    const pos = isImageEdit(prev) ? prev : DEFAULT_IMAGE_POSITION;
    const newEdits = { ...sideState.edits };
    if (url) {
      newEdits[fieldId] = {
        url,
        zoom: pos.zoom,
        offsetX: pos.offsetX + dx,
        offsetY: pos.offsetY + dy,
      };
    }

    set(commitSide(state, target, { edits: newEdits }));
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
