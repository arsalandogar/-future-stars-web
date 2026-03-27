import type { SvgJsonNode } from './types.ts';
import type {
  EditableTextField,
  EditableColorField,
  EditableImageField,
} from './svg-editable-fields.ts';
import type { Edits } from './edit-operations.ts';
import {
  prepareTemplate,
  applyEditsForRender,
  withPresetColors,
  withPresetTextColors,
} from './edit-operations.ts';

export type Side = 'front' | 'back';

export interface SideState {
  workingCopy: SvgJsonNode | null;
  editableFields: EditableTextField[];
  editableColorFields: EditableColorField[];
  editableImageFields: EditableImageField[];
  edits: Edits;
  revision: number;
  appliedPresetId: number | null;
  appliedPresetColors: { bg: string; fg: string }[] | null;
}

export function createEmptySideState(): SideState {
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
export function initializeSideSnapshot(
  svgNode: SvgJsonNode,
  previous: SideState
): SideState {
  const { workingCopy, fields } = prepareTemplate(svgNode);

  const preservedEdits: Edits = { ...previous.edits };

  if (previous.appliedPresetColors) {
    // Reapply preset colors positionally on the new template before replaying
    // explicit edits. This preserves preset intent across template changes even
    // when some preset colors were not stored in edits on the previous template.
    const bgColors = previous.appliedPresetColors.map((p) => p.bg);
    withPresetColors({}, fields.colorFields, bgColors);
  }
  applyEditsForRender(fields, preservedEdits);

  // Apply fg text colors after edits so they take final precedence on text fills
  if (previous.appliedPresetColors) {
    withPresetTextColors(
      fields.textFields,
      fields.colorFields,
      previous.appliedPresetColors
    );
  }

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
  };
}
