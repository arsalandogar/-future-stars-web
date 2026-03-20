// Pages
export { ColorPalettesListPage } from './pages/color-palettes-list-page';
export { ColorPaletteDetailPage } from './pages/color-palette-detail-page';

// Components
export { ColorPalettesList } from './components/color-palettes-list';
export { ColorPaletteDetail } from './components/color-palette-detail';

// API
export { useColorPalettes } from './api/get-color-palettes';
export { colorPaletteQuery, useColorPalette } from './api/get-color-palette';
export { useCreateColorPalette } from './api/create-color-palette';
export { useUpdateColorPalette } from './api/update-color-palette';
export { useDeleteColorPalette } from './api/delete-color-palette';
export { useAttachTemplatePalette } from './api/attach-template-palette';
export { useDetachTemplatePalette } from './api/detach-template-palette';

// Types
export type {
  ColorPair,
  ColorPalette,
  ColorPalettesListResponse,
  ColorPalettesListParams,
  ColorPaletteResponse,
  CreateColorPaletteParams,
  UpdateColorPaletteParams,
  AttachTemplatePaletteParams,
  DetachTemplatePaletteParams,
} from './types';
