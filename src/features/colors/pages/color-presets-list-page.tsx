import { Head } from '@/components/seo/head';

import { ColorPresetsList } from '../components/color-presets-list';

export function ColorPresetsPage() {
  return (
    <>
      <Head title="Color Presets" description="Manage Color Presets" />
      <ColorPresetsList />
    </>
  );
}
