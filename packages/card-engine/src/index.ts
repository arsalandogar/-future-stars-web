// Types
export type {
  SvgJsonNode,
  ColorTarget,
  OklabOffset,
  ImageEdit,
  EditValue,
} from './types.ts';
export { isImageEdit, getEditUrl, DEFAULT_IMAGE_POSITION } from './types.ts';

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
