import { create } from 'zustand';

import type { SvgJsonNode } from '@/types/svg';
import type { EditableFieldId } from '@/features/templates';
import { cloneWithStableIds } from '@/utils/svg-tree';

import {
  applyColorEdit,
  applyTextEdit,
  discoverEditableColorFields,
  discoverEditableTextFields,
  type EditableColorField,
  type EditableTextField,
} from '../utils/svg-editable-fields';

type Edits = Partial<Record<EditableFieldId, string>>;

interface CardEditorState {
  workingCopy: SvgJsonNode | null;
  editableFields: EditableTextField[];
  editableColorFields: EditableColorField[];
  edits: Edits;
  revision: number;
  focusedFieldId: EditableFieldId | null;
  appliedPresetId: number | null;
  appliedPresetColors: string[] | null;

  initializeFromSvg: (svgNode: SvgJsonNode) => void;
  updateTextField: (fieldId: EditableFieldId, value: string) => void;
  updateColorField: (fieldId: EditableFieldId, color: string) => void;
  applyColorPreset: (colors: string[], presetId: number) => void;
  swapColors: (fieldIdA: EditableFieldId, fieldIdB: EditableFieldId) => void;
  resetAllColors: () => void;
  resetToPreset: () => void;
  resetField: (fieldId: EditableFieldId) => void;
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

const initialState = {
  workingCopy: null as SvgJsonNode | null,
  editableFields: [] as EditableTextField[],
  editableColorFields: [] as EditableColorField[],
  edits: {} as Edits,
  revision: 0,
  focusedFieldId: null as EditableFieldId | null,
  appliedPresetId: null as number | null,
  appliedPresetColors: null as string[] | null,
};

export const useCardEditorStore = create<CardEditorState>()((set, get) => ({
  ...initialState,

  initializeFromSvg: (svgNode) => {
    const clone = cloneWithStableIds(svgNode);
    const fields = discoverEditableTextFields(clone);
    const colorFields = discoverEditableColorFields(clone);

    // Preserve existing edits that match new template's fields
    const prevEdits = get().edits;
    const newFieldIds = new Set([
      ...fields.map((f) => f.fieldId),
      ...colorFields.map((f) => f.fieldId),
    ]);
    const preservedEdits: Edits = {};

    for (const [fieldId, value] of Object.entries(prevEdits)) {
      if (newFieldIds.has(fieldId as EditableFieldId)) {
        preservedEdits[fieldId as EditableFieldId] = value;
      }
    }

    // Re-apply preserved text edits to the new working copy
    for (const field of fields) {
      const editedValue = preservedEdits[field.fieldId];
      if (editedValue != null) {
        applyTextEdit(field, editedValue);
      }
    }

    // Re-apply preserved color edits to the new working copy
    for (const colorField of colorFields) {
      const editedValue = preservedEdits[colorField.fieldId];
      if (editedValue != null) {
        applyColorEdit(colorField, editedValue);
      }
    }

    set({
      workingCopy: clone,
      editableFields: fields,
      editableColorFields: colorFields,
      edits: preservedEdits,
      revision: get().revision + 1,
      appliedPresetId: null,
    });
  },

  updateTextField: (fieldId, value) => {
    const { editableFields, edits, revision } = get();
    const field = editableFields.find((f) => f.fieldId === fieldId);
    if (!field) return;

    applyTextEdit(field, value);

    const newEdits = { ...edits };
    if (value === field.originalValue) {
      delete newEdits[fieldId];
    } else {
      newEdits[fieldId] = value;
    }

    set({ edits: newEdits, revision: revision + 1 });
  },

  updateColorField: (fieldId, color) => {
    const { editableColorFields, edits, revision } = get();
    const field = editableColorFields.find((f) => f.fieldId === fieldId);
    if (!field) return;

    const newEdits = { ...edits };
    setColorEdit(newEdits, field, color);

    set({ edits: newEdits, revision: revision + 1, appliedPresetId: null });
  },

  applyColorPreset: (colors, presetId) => {
    const { editableColorFields, edits, revision } = get();
    const newEdits = { ...edits };

    for (let i = 0; i < editableColorFields.length && i < colors.length; i++) {
      setColorEdit(newEdits, editableColorFields[i], colors[i]);
    }

    set({
      edits: newEdits,
      revision: revision + 1,
      appliedPresetId: presetId,
      appliedPresetColors: colors,
    });
  },

  swapColors: (fieldIdA, fieldIdB) => {
    const { editableColorFields, edits, revision } = get();
    const fieldA = editableColorFields.find((f) => f.fieldId === fieldIdA);
    const fieldB = editableColorFields.find((f) => f.fieldId === fieldIdB);
    if (!fieldA || !fieldB) return;

    const colorA = edits[fieldIdA] ?? fieldA.originalValue;
    const colorB = edits[fieldIdB] ?? fieldB.originalValue;

    const newEdits = { ...edits };
    setColorEdit(newEdits, fieldA, colorB);
    setColorEdit(newEdits, fieldB, colorA);

    set({ edits: newEdits, revision: revision + 1, appliedPresetId: null });
  },

  resetAllColors: () => {
    const { editableColorFields, edits, revision } = get();
    const newEdits = { ...edits };

    for (const field of editableColorFields) {
      setColorEdit(newEdits, field, field.originalValue);
    }

    set({
      edits: newEdits,
      revision: revision + 1,
      appliedPresetId: null,
      appliedPresetColors: null,
    });
  },

  resetToPreset: () => {
    const {
      editableColorFields,
      appliedPresetColors,
      appliedPresetId,
      edits,
      revision,
    } = get();
    const newEdits = { ...edits };

    for (let i = 0; i < editableColorFields.length; i++) {
      const field = editableColorFields[i];
      const targetColor = appliedPresetColors?.[i] ?? field.originalValue;
      setColorEdit(newEdits, field, targetColor);
    }

    set({
      edits: newEdits,
      revision: revision + 1,
      appliedPresetId: appliedPresetColors ? appliedPresetId : null,
    });
  },

  resetField: (fieldId) => {
    const { editableFields, edits, revision } = get();
    const field = editableFields.find((f) => f.fieldId === fieldId);
    if (!field) return;

    applyTextEdit(field, field.originalValue);

    const newEdits = { ...edits };
    delete newEdits[fieldId];

    set({ edits: newEdits, revision: revision + 1 });
  },

  setFocusedFieldId: (fieldId) => set({ focusedFieldId: fieldId }),

  reset: () => set(initialState),
}));
