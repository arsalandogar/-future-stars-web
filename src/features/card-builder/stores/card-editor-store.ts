import { create } from 'zustand';

import type { SvgJsonNode } from '@/types/svg';
import type { EditableFieldId } from '@/features/templates';
import { cloneWithStableIds } from '@/utils/svg-tree';

import {
  applyTextEdit,
  discoverEditableTextFields,
  type EditableTextField,
} from '../utils/svg-editable-fields';

interface CardEditorState {
  workingCopy: SvgJsonNode | null;
  editableFields: EditableTextField[];
  edits: Partial<Record<EditableFieldId, string>>;
  revision: number;
  focusedFieldId: EditableFieldId | null;

  initializeFromSvg: (svgNode: SvgJsonNode) => void;
  updateTextField: (fieldId: EditableFieldId, value: string) => void;
  resetField: (fieldId: EditableFieldId) => void;
  setFocusedFieldId: (fieldId: EditableFieldId | null) => void;
  reset: () => void;
}

const initialState = {
  workingCopy: null as SvgJsonNode | null,
  editableFields: [] as EditableTextField[],
  edits: {} as Partial<Record<EditableFieldId, string>>,
  revision: 0,
  focusedFieldId: null as EditableFieldId | null,
};

export const useCardEditorStore = create<CardEditorState>()((set, get) => ({
  ...initialState,

  initializeFromSvg: (svgNode) => {
    const clone = cloneWithStableIds(svgNode);
    const fields = discoverEditableTextFields(clone);

    // Preserve existing edits that match new template's fields
    const prevEdits = get().edits;
    const newFieldIds = new Set(fields.map((f) => f.fieldId));
    const preservedEdits: Partial<Record<EditableFieldId, string>> = {};

    for (const [fieldId, value] of Object.entries(prevEdits)) {
      if (newFieldIds.has(fieldId as EditableFieldId)) {
        preservedEdits[fieldId as EditableFieldId] = value;
      }
    }

    // Re-apply preserved edits to the new working copy
    for (const field of fields) {
      const editedValue = preservedEdits[field.fieldId];
      if (editedValue != null) {
        applyTextEdit(field, editedValue);
      }
    }

    set({
      workingCopy: clone,
      editableFields: fields,
      edits: preservedEdits,
      revision: get().revision + 1,
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
