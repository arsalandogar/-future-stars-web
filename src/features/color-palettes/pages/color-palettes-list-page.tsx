import { Head } from '@/components/seo/head';

import { ColorPalettesList } from '../components/color-palettes-list';

export function ColorPalettesListPage() {
  return (
    <>
      <Head title="Color Palettes" description="Manage Color Palettes" />
      <ColorPalettesList />
    </>
  );
}
