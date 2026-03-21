// Types
export type {
  SvgJsonNode,
  ColorTarget,
  OklabOffset,
  ImageEdit,
  EditValue,
  TouchBounds,
} from './types.ts';
export {
  isImageEdit,
  getEditValue,
  DEFAULT_IMAGE_POSITION,
  ZOOM_MIN,
  ZOOM_MAX,
  CARD_WIDTH,
  CARD_HEIGHT,
  CARD_BLEED_WIDTH,
  CARD_BLEED_HEIGHT,
  hasBleeds,
  getCardBounds,
} from './types.ts';

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
  parseTouchBounds,
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

// Text compression
export {
  measureTextWidth,
  applyTextCompression,
  type FontData,
  type FontResolverInput,
  type FontResolver,
  type TextCompressionWarningReason,
  type TextCompressionWarning,
  type ApplyTextCompressionOptions,
  type ApplyTextCompressionResult,
  type FontLookupResult,
} from './text-compression.ts';

// Font matching
export {
  normalizeFamily,
  normalizeWeight,
  normalizeStyle,
  normalizeFileToken,
  stripQuotes,
  weightToVariantToken,
  pickNearestWeight,
  generateFontFileCandidates,
  type FontStyle,
  type FontEntry,
} from './font-matching.ts';

// Font resolver factory
export {
  createFontResolver,
  type FontRegistryEntry,
  type CreateFontResolverOptions,
} from './create-font-resolver.ts';

// Side state
export {
  type Side,
  type SideState,
  createEmptySideState,
  initializeSideSnapshot,
} from './side-state.ts';

// Edit operations
export {
  TOUCH_TARGET_ATTR,
  TOUCH_TARGET_TYPE_ATTR,
  prepareTemplate,
  applyEdits,
  applyEditsForRender,
  cleanEditsForSave,
  cleanEditsForPersistence,
  renderEditedTemplate,
  withColorEdit,
  withImageEdit,
  applyImageZoom,
  nudgeImageNodes,
  withZoomEdit,
  withNudgeEdit,
  withTextEdit,
  withPresetColors,
  withPresetTextColors,
  withSwappedColors,
  withAllColorsReset,
  withImageRemoved,
  withTextFieldReset,
  type Edits,
  type DiscoveredFields,
  type PrepareTemplateOptions,
  type CleanEditsForPersistenceOptions,
} from './edit-operations.ts';
