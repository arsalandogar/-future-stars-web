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

type Edits = Partial<Record<EditableFieldId, EditValue>>;

interface CardEditorState {
  workingCopy: SvgJsonNode | null;
  editableFields: EditableTextField[];
  editableColorFields: EditableColorField[];
  editableImageFields: EditableImageField[];
  edits: Edits;
  revision: number;
  focusedFieldId: EditableFieldId | null;
  appliedPresetId: number | null;
  appliedPresetColors: string[] | null;

  initializeFromSvg: (svgNode: SvgJsonNode | undefined) => void;
  updateTextField: (fieldId: EditableFieldId, value: string) => void;
  updateColorField: (fieldId: EditableFieldId, color: string) => void;
  updateImageField: (fieldId: EditableFieldId, imageUrl: string) => void;
  removeImageField: (fieldId: EditableFieldId) => void;
  adjustImageZoom: (
    fieldId: EditableFieldId,
    zoom: number,
    offsetX: number,
    offsetY: number
  ) => void;
  nudgeImagePosition: (
    fieldId: EditableFieldId,
    dx: number,
    dy: number
  ) => void;
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
  editableImageFields: [] as EditableImageField[],
  edits: {} as Edits,
  revision: 0,
  focusedFieldId: null as EditableFieldId | null,
  appliedPresetId: null as number | null,
  appliedPresetColors: null as string[] | null,
};

export const useCardEditorStore = create<CardEditorState>()((set, get) => ({
  ...initialState,

  initializeFromSvg: (svgNode) => {
    if (!svgNode) return;
    const clone = cloneWithStableIds(svgNode);
    const fields = discoverEditableTextFields(clone);
    const colorFields = discoverEditableColorFields(clone);
    const imageFields = discoverEditableImageFields(clone);

    // Preserve existing non-color edits that match new template's fields.
    // Color edits are excluded because they're positional (tied to a
    // template's color field order) and would leak incorrect values when
    // switching templates. If a color preset was active, it gets re-applied
    // positionally below.
    const prevEdits = get().edits;
    const appliedPresetColors = get().appliedPresetColors;
    const appliedPresetId = get().appliedPresetId;
    const nonColorFieldIds = new Set([
      ...fields.map((f) => f.fieldId),
      ...imageFields.map((f) => f.fieldId),
    ]);
    const preservedEdits: Edits = {};

    for (const [fieldId, value] of Object.entries(prevEdits)) {
      if (nonColorFieldIds.has(fieldId as EditableFieldId)) {
        preservedEdits[fieldId as EditableFieldId] = value;
      }
    }

    // Re-apply preserved text edits to the new working copy
    for (const field of fields) {
      const editedValue = preservedEdits[field.fieldId];
      if (typeof editedValue === 'string') {
        applyTextEdit(field, editedValue);
      }
    }

    // Re-apply color preset positionally to the new template's color fields
    if (appliedPresetColors) {
      for (let i = 0; i < colorFields.length; i++) {
        const color =
          i < appliedPresetColors.length
            ? appliedPresetColors[i]
            : colorFields[i].originalValue;
        setColorEdit(preservedEdits, colorFields[i], color);
      }
    }

    // Re-apply preserved image edits to the new working copy
    for (const imageField of imageFields) {
      const editedValue = preservedEdits[imageField.fieldId];
      const url = getEditUrl(editedValue);
      if (url) {
        applyImageEdit(imageField, url);
      }
    }

    set({
      workingCopy: clone,
      editableFields: fields,
      editableColorFields: colorFields,
      editableImageFields: imageFields,
      edits: preservedEdits,
      revision: get().revision + 1,
      appliedPresetId: appliedPresetColors ? appliedPresetId : null,
      appliedPresetColors,
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

    for (let i = 0; i < editableColorFields.length; i++) {
      const color =
        i < colors.length ? colors[i] : editableColorFields[i].originalValue;
      setColorEdit(newEdits, editableColorFields[i], color);
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

    const colorA = getEditUrl(edits[fieldIdA]) ?? fieldA.originalValue;
    const colorB = getEditUrl(edits[fieldIdB]) ?? fieldB.originalValue;

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

  updateImageField: (fieldId, imageUrl) => {
    const { editableImageFields, edits, revision } = get();
    const field = editableImageFields.find((f) => f.fieldId === fieldId);
    if (!field) return;

    applyImageEdit(field, imageUrl);

    const newEdits = { ...edits };
    if (imageUrl === field.originalValue) {
      delete newEdits[fieldId];
    } else {
      // Preserve existing position if just swapping URLs (e.g. local -> CDN)
      const prev = edits[fieldId];
      const position = isImageEdit(prev) ? prev : DEFAULT_IMAGE_POSITION;
      newEdits[fieldId] = { ...position, url: imageUrl };
    }

    set({ edits: newEdits, revision: revision + 1 });
  },

  removeImageField: (fieldId) => {
    const { editableImageFields, edits, revision } = get();
    const field = editableImageFields.find((f) => f.fieldId === fieldId);
    if (!field) return;

    applyImageEdit(field, field.originalValue);

    const newEdits = { ...edits };
    delete newEdits[fieldId];

    set({ edits: newEdits, revision: revision + 1 });
  },

  adjustImageZoom: (fieldId, zoom, offsetX, offsetY) => {
    const { editableImageFields, edits, revision } = get();
    const field = editableImageFields.find((f) => f.fieldId === fieldId);
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
    const prev = edits[fieldId];
    const url = getEditUrl(prev) ?? '';
    const newEdits = { ...edits };
    if (url) {
      newEdits[fieldId] = { url, zoom, offsetX, offsetY };
    }

    set({ edits: newEdits, revision: revision + 1 });
  },

  nudgeImagePosition: (fieldId, dx, dy) => {
    const { editableImageFields, edits, revision } = get();
    const field = editableImageFields.find((f) => f.fieldId === fieldId);
    if (!field) return;

    for (const node of field.elementNodes) {
      const curX = parseFloat(node.attributes.x ?? '0');
      const curY = parseFloat(node.attributes.y ?? '0');
      node.attributes.x = String(curX + dx);
      node.attributes.y = String(curY + dy);
    }

    // Update position in the image edit entry
    const prev = edits[fieldId];
    const url = getEditUrl(prev) ?? '';
    const pos = isImageEdit(prev) ? prev : DEFAULT_IMAGE_POSITION;
    const newEdits = { ...edits };
    if (url) {
      newEdits[fieldId] = {
        url,
        zoom: pos.zoom,
        offsetX: pos.offsetX + dx,
        offsetY: pos.offsetY + dy,
      };
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
