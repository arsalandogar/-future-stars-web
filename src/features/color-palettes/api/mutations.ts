import { createCrudMutations } from '@/lib/react-query';

import type {
  ColorPalette,
  CreateColorPaletteParams,
  UpdateColorPaletteParams,
} from '../types';
import { useColorPalettes } from './get-color-palettes';
import { colorPaletteQuery } from './get-color-palette';

export const colorPaletteMutations = createCrudMutations<
  CreateColorPaletteParams,
  UpdateColorPaletteParams,
  ColorPalette
>({
  endpoint: 'admin/color-palettes',
  entityName: 'Color Palette',
  listQueryKey: useColorPalettes.getKey(),
  extraInvalidations: [colorPaletteQuery.getKey()],
});
