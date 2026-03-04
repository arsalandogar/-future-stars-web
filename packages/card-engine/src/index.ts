// Types
export type {
  SvgJsonNode,
  ColorTarget,
  OklabOffset,
  ImageEdit,
  EditValue,
} from './types.ts';
export { isImageEdit, getEditValue, DEFAULT_IMAGE_POSITION } from './types.ts';

// Vocabulary
export {
  EDITABLE_FIELDS,
  type EditableFieldId,
  type EditableFieldType,
} from './vocabulary.ts';

// Color math
export {
  applyOklabOffset,
  computeOklabOffset,
  colorDistance,
  clusterColors,
  parseOffset,
  serializeOffset,
  isZeroOffset,
  type ColorCluster,
  type ClusterMember,
} from './color-math.ts';

// SVG editable fields
export {
  discoverEditableTextFields,
  applyTextEdit,
  discoverEditableColorFields,
  applyColorEdit,
  discoverEditableImageFields,
  applyImageEdit,
  type EditableTextField,
  type ColorFieldElement,
  type EditableColorField,
  type ImageClipBounds,
  type EditableImageField,
} from './svg-editable-fields.ts';

// SVG parsing
export { parseSvgSync, parseSvg, stringifySvg } from './parse-svg.ts';

// SVG cloning
export { cloneWithStableIds } from './svg-clone.ts';

// Edit operations
export {
  prepareTemplate,
  applyEdits,
  cleanEditsForSave,
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
  type Edits,
  type DiscoveredFields,
} from './edit-operations.ts';
