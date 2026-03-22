import type {
  SvgJsonNode,
  EditValue,
  ImageEdit,
  TouchBounds,
} from './types.ts';
import { isImageEdit, getEditValue, DEFAULT_IMAGE_POSITION } from './types.ts';
import type { EditableFieldId } from './vocabulary.ts';
import {
  discoverEditableTextFields,
  discoverEditableColorFields,
  discoverEditableImageFields,
  applyTextEdit,
  applyColorEdit,
  applyImageEdit,
  writeColorValue,
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

export interface PrepareTemplateOptions {
  includeTouchTargets?: boolean;
}

export interface CleanEditsForPersistenceOptions {
  isPersistableImageUrl?: (url: string) => boolean;
}

/** Attribute used to mark touch target overlay rects. */
export const TOUCH_TARGET_ATTR = 'data-touch-target';

/** Attribute that stores the field type ('image' | 'text') on touch target rects. */
export const TOUCH_TARGET_TYPE_ATTR = 'data-touch-target-type';

function discoverFields(workingCopy: SvgJsonNode): DiscoveredFields {
  return {
    textFields: discoverEditableTextFields(workingCopy),
    colorFields: discoverEditableColorFields(workingCopy),
    imageFields: discoverEditableImageFields(workingCopy),
  };
}

/** Clone an SVG node and discover all editable fields in one call. */
export function prepareTemplate(
  svgNode: SvgJsonNode,
  options: PrepareTemplateOptions = {}
): {
  workingCopy: SvgJsonNode;
  fields: DiscoveredFields;
} {
  const workingCopy = cloneWithStableIds(svgNode);
  const fields = discoverFields(workingCopy);
  const { includeTouchTargets = true } = options;

  if (!includeTouchTargets) {
    return { workingCopy, fields };
  }

  // Inject transparent touch target rects for fields with touch bounds.
  // Image targets are pushed first so they sit below text targets in SVG
  // paint order — otherwise a full-card image touch area blocks text clicks.
  const touchTargets: SvgJsonNode[] = [];

  const collectTouchTargets = (
    fieldList: { fieldId: EditableFieldId; touchBounds?: TouchBounds }[],
    type: string
  ) => {
    for (const field of fieldList) {
      if (!field.touchBounds) continue;
      const b = field.touchBounds;
      touchTargets.push({
        name: 'rect',
        type: 'element',
        value: '',
        attributes: {
          x: String(b.x),
          y: String(b.y),
          width: String(b.width),
          height: String(b.height),
          fill: 'transparent',
          'pointer-events': 'all',
          [TOUCH_TARGET_ATTR]: field.fieldId,
          [TOUCH_TARGET_TYPE_ATTR]: type,
        },
        children: [],
      });
    }
  };

  collectTouchTargets(fields.imageFields, 'image');
  collectTouchTargets(fields.textFields, 'text');

  if (touchTargets.length > 0) {
    workingCopy.children.push(...touchTargets);
  }

  return { workingCopy, fields };
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
    const url = getEditValue(editedValue);
    if (url) {
      applyImageEdit(field, url);
    }
  }
}

/** Re-apply edits including image zoom/offset transforms for final rendering. */
export function applyEditsForRender(
  fields: DiscoveredFields,
  edits: Edits
): void {
  applyEdits(fields, edits);

  for (const field of fields.imageFields) {
    const editedValue = edits[field.fieldId];
    if (!isImageEdit(editedValue)) continue;
    if (!editedValue.url) continue;

    applyImageZoom(
      field.elementNodes,
      editedValue.zoom,
      editedValue.offsetX,
      editedValue.offsetY,
      editedValue
    );
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
 * Strip edits that are invalid for persistence, including unknown fields and
 * image URLs that are only valid in the current runtime such as blob URLs.
 */
export function cleanEditsForPersistence(
  edits: Edits,
  fields: DiscoveredFields,
  options: CleanEditsForPersistenceOptions = {}
): Edits {
  const cleaned = cleanEditsForSave(edits, fields);
  const imageFieldIds = new Set(
    fields.imageFields.map((field) => field.fieldId)
  );
  const isPersistableImageUrl =
    options.isPersistableImageUrl ??
    ((url: string) => !url.startsWith('blob:'));

  const persistable: Edits = {};
  for (const [key, value] of Object.entries(cleaned)) {
    const fieldId = key as EditableFieldId;
    if (!imageFieldIds.has(fieldId)) {
      persistable[fieldId] = value;
      continue;
    }

    const url = getEditValue(value);
    if (url && isPersistableImageUrl(url)) {
      persistable[fieldId] = value;
    }
  }

  return persistable;
}

/** Clone a template, apply edits, and return a clean edited SVG tree. */
export function renderEditedTemplate(
  svgNode: SvgJsonNode,
  edits: Edits,
  options: PrepareTemplateOptions = {}
): {
  workingCopy: SvgJsonNode;
  fields: DiscoveredFields;
} {
  const { workingCopy, fields } = prepareTemplate(svgNode, options);
  applyEditsForRender(fields, edits);
  return { workingCopy, fields };
}

/** Returns new Edits with a color edit applied. Also mutates SVG nodes. */
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
 * Returns new Edits with an image URL change, preserving existing zoom/offset position.
 * Also mutates SVG nodes to reflect the new image URL.
 */
export function withImageEdit(
  edits: Edits,
  field: EditableImageField,
  imageUrl: string
): Edits {
  applyImageEdit(field, imageUrl);
  const newEdits = { ...edits };
  if (imageUrl === field.originalValue) {
    delete newEdits[field.fieldId];
  } else {
    const prev = edits[field.fieldId];
    const position = isImageEdit(prev) ? prev : DEFAULT_IMAGE_POSITION;
    newEdits[field.fieldId] = { ...position, url: imageUrl };
  }
  return newEdits;
}

/** Mutate SVG image nodes to apply zoom and offset.
 *  When the edit includes sourceWidth/sourceHeight, uses cover-aware scaling
 *  so the image isn't distorted when source AR differs from element AR. */
export function applyImageZoom(
  nodes: SvgJsonNode[],
  zoom: number,
  offsetX: number,
  offsetY: number,
  edit?: Partial<ImageEdit>
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

    let newW: number;
    let newH: number;

    // Cover-aware zoom when source dimensions are known
    if (edit?.sourceWidth && edit?.sourceHeight) {
      const coverScale = Math.max(
        origW / edit.sourceWidth,
        origH / edit.sourceHeight
      );
      newW = edit.sourceWidth * coverScale * zoom;
      newH = edit.sourceHeight * coverScale * zoom;
    } else {
      // Fallback: simple zoom (backward compatible)
      newW = origW * zoom;
      newH = origH * zoom;
    }

    node.attributes.width = String(newW);
    node.attributes.height = String(newH);
    node.attributes.x = String(origX - (newW - origW) / 2 + offsetX);
    node.attributes.y = String(origY - (newH - origH) / 2 + offsetY);
    node.attributes.preserveAspectRatio = 'none';
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
  const url = getEditValue(prev) ?? '';
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
  const url = getEditValue(prev) ?? '';
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

/** Returns new Edits with a text edit applied. Also mutates SVG nodes. */
export function withTextEdit(
  edits: Edits,
  field: EditableTextField,
  value: string
): Edits {
  const newEdits = { ...edits };
  applyTextEdit(field, value);
  if (value === field.originalValue) {
    delete newEdits[field.fieldId];
  } else {
    newEdits[field.fieldId] = value;
  }
  return newEdits;
}

/** Apply preset colors positionally to color fields, falling back to original values. */
export function withPresetColors(
  edits: Edits,
  colorFields: EditableColorField[],
  presetColors: string[]
): Edits {
  let result = edits;
  for (let i = 0; i < colorFields.length; i++) {
    const field = colorFields[i];
    const color =
      i < presetColors.length ? presetColors[i] : field.originalValue;
    result = withColorEdit(result, field, color);
  }
  return result;
}

/** Swap the colors of two fields. */
export function withSwappedColors(
  edits: Edits,
  fieldA: EditableColorField,
  fieldB: EditableColorField
): Edits {
  const colorA = getEditValue(edits[fieldA.fieldId]) ?? fieldA.originalValue;
  const colorB = getEditValue(edits[fieldB.fieldId]) ?? fieldB.originalValue;
  let newEdits = withColorEdit(edits, fieldA, colorB);
  newEdits = withColorEdit(newEdits, fieldB, colorA);
  return newEdits;
}

/** Reset all color fields to their original values. */
export function withAllColorsReset(
  edits: Edits,
  colorFields: EditableColorField[]
): Edits {
  let newEdits = edits;
  for (const field of colorFields) {
    newEdits = withColorEdit(newEdits, field, field.originalValue);
  }
  return newEdits;
}

/** Remove an image edit, restoring the original. Also mutates SVG nodes. */
export function withImageRemoved(
  edits: Edits,
  field: EditableImageField
): Edits {
  applyImageEdit(field, field.originalValue);
  const newEdits = { ...edits };
  delete newEdits[field.fieldId];
  return newEdits;
}

/** Reset a text field to its original value. Also mutates SVG nodes. */
export function withTextFieldReset(
  edits: Edits,
  field: EditableTextField
): Edits {
  applyTextEdit(field, field.originalValue);
  const newEdits = { ...edits };
  delete newEdits[field.fieldId];
  return newEdits;
}

/**
 * Apply foreground colors from color pairs to text elements linked to color areas.
 * Text elements with a `textColorArea` get the `fg` color from the matching
 * color pair at the same index as their linked color field.
 * Mutates SVG nodes directly.
 */
export function withPresetTextColors(
  textFields: EditableTextField[],
  colorFields: EditableColorField[],
  colorPairs: { fg: string }[]
): void {
  const colorIndexMap = new Map(colorFields.map((cf, i) => [cf.fieldId, i]));

  for (const textField of textFields) {
    if (!textField.textColorArea) continue;

    const colorIndex = colorIndexMap.get(textField.textColorArea);
    if (colorIndex == null || colorIndex >= colorPairs.length) continue;

    const fgColor = colorPairs[colorIndex].fg;
    for (const node of textField.elementNodes) {
      writeColorValue(node, 'fill', fgColor);
    }
  }
}
