import { Head } from '@/components/seo/head';
import { ColorPresetsList } from '../color-presets';

export function ColorPresetsPage() {
  return (
    <>
      <Head title="Color Presets" description="Manage Color Presets" />
      <ColorPresetsList />
    </>
  );
}
