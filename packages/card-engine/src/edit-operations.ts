import type { SvgJsonNode, EditValue, ImageEdit } from './types.ts';
import { isImageEdit, getEditUrl, DEFAULT_IMAGE_POSITION } from './types.ts';
import type { EditableFieldId } from './vocabulary.ts';
import {
  discoverEditableTextFields,
  discoverEditableColorFields,
  discoverEditableImageFields,
  applyTextEdit,
  applyColorEdit,
  applyImageEdit,
  type EditableTextField,
  type EditableColorField,
  type EditableImageField,
} from './svg-editable-fields.ts';
import { cloneWithStableIds } from './svg-clone.ts';

/** A record of edits keyed by field id. */
export type Edits = Partial<Record<EditableFieldId, EditValue>>;

/** All discovered editable fields from a template. */
export interface DiscoveredFields {
  textFields: EditableTextField[];
  colorFields: EditableColorField[];
  imageFields: EditableImageField[];
}

/** Clone an SVG node and discover all editable fields in one call. */
export function prepareTemplate(svgNode: SvgJsonNode): {
  workingCopy: SvgJsonNode;
  fields: DiscoveredFields;
} {
  const workingCopy = cloneWithStableIds(svgNode);
  return {
    workingCopy,
    fields: {
      textFields: discoverEditableTextFields(workingCopy),
      colorFields: discoverEditableColorFields(workingCopy),
      imageFields: discoverEditableImageFields(workingCopy),
    },
  };
}

/** Re-apply edits to discovered fields on a freshly cloned working copy. */
export function applyEdits(fields: DiscoveredFields, edits: Edits): void {
  for (const field of fields.textFields) {
    const editedValue = edits[field.fieldId];
    if (typeof editedValue === 'string') {
      applyTextEdit(field, editedValue);
    }
  }

  for (const field of fields.colorFields) {
    const editedValue = edits[field.fieldId];
    if (typeof editedValue === 'string') {
      applyColorEdit(field, editedValue);
    }
  }

  for (const field of fields.imageFields) {
    const editedValue = edits[field.fieldId];
    const url = getEditUrl(editedValue);
    if (url) {
      applyImageEdit(field, url);
    }
  }
}

/** Strip edits whose field ids don't exist in the template. */
export function cleanEditsForSave(
  edits: Edits,
  fields: DiscoveredFields
): Edits {
  const validIds = new Set<EditableFieldId>();
  for (const f of fields.textFields) validIds.add(f.fieldId);
  for (const f of fields.colorFields) validIds.add(f.fieldId);
  for (const f of fields.imageFields) validIds.add(f.fieldId);

  const cleaned: Edits = {};
  for (const [key, value] of Object.entries(edits)) {
    if (validIds.has(key as EditableFieldId)) {
      cleaned[key as EditableFieldId] = value;
    }
  }
  return cleaned;
}

/**
 * Pure function: returns new Edits with a color edit applied.
 * Also mutates the SVG field nodes to reflect the color.
 */
export function withColorEdit(
  edits: Edits,
  field: EditableColorField,
  color: string
): Edits {
  const newEdits = { ...edits };
  applyColorEdit(field, color);
  if (color === field.originalValue) {
    delete newEdits[field.fieldId];
  } else {
    newEdits[field.fieldId] = color;
  }
  return newEdits;
}

/**
 * Pure function: returns new Edits with an image URL change,
 * preserving existing zoom/offset position.
 */
export function withImageEdit(
  edits: Edits,
  field: EditableImageField,
  fieldId: EditableFieldId,
  imageUrl: string
): Edits {
  const newEdits = { ...edits };
  if (imageUrl === field.originalValue) {
    delete newEdits[fieldId];
  } else {
    const prev = edits[fieldId];
    const position = isImageEdit(prev) ? prev : DEFAULT_IMAGE_POSITION;
    newEdits[fieldId] = { ...position, url: imageUrl };
  }
  return newEdits;
}

/** Mutate SVG image nodes to apply zoom and offset. */
export function applyImageZoom(
  nodes: SvgJsonNode[],
  zoom: number,
  offsetX: number,
  offsetY: number
): void {
  for (const node of nodes) {
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
}

/** Mutate SVG image nodes to nudge position by dx/dy. */
export function nudgeImageNodes(
  nodes: SvgJsonNode[],
  dx: number,
  dy: number
): void {
  for (const node of nodes) {
    const curX = parseFloat(node.attributes.x ?? '0');
    const curY = parseFloat(node.attributes.y ?? '0');
    node.attributes.x = String(curX + dx);
    node.attributes.y = String(curY + dy);
  }
}

/** Build updated edits after a zoom change. */
export function withZoomEdit(
  edits: Edits,
  fieldId: EditableFieldId,
  zoom: number,
  offsetX: number,
  offsetY: number
): Edits {
  const prev = edits[fieldId];
  const url = getEditUrl(prev) ?? '';
  if (!url) return edits;
  const newEdits = { ...edits };
  newEdits[fieldId] = { url, zoom, offsetX, offsetY } satisfies ImageEdit;
  return newEdits;
}

/** Build updated edits after a nudge. */
export function withNudgeEdit(
  edits: Edits,
  fieldId: EditableFieldId,
  dx: number,
  dy: number
): Edits {
  const prev = edits[fieldId];
  const url = getEditUrl(prev) ?? '';
  if (!url) return edits;
  const pos = isImageEdit(prev) ? prev : DEFAULT_IMAGE_POSITION;
  const newEdits = { ...edits };
  newEdits[fieldId] = {
    url,
    zoom: pos.zoom,
    offsetX: pos.offsetX + dx,
    offsetY: pos.offsetY + dy,
  } satisfies ImageEdit;
  return newEdits;
}
