import { Head } from '@/components/seo/head';

import { ColorPaletteDetail } from '../components/color-palette-detail';

interface Props {
  id: number;
}

export function ColorPaletteDetailPage({ id }: Props) {
  return (
    <>
      <Head title="Color Palette Detail" description="View Color Palette" />
      <ColorPaletteDetail id={id} />
    </>
  );
}
