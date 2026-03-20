import { EntityFormModal } from '@/components/ui/entity-form-modal';

import type { ColorPalette } from '../types';
import { ColorPaletteForm } from './color-palette-form';

type ColorPaletteModalProps = {
  item: ColorPalette | undefined;
  opened: boolean;
  onClose: () => void;
};

export function ColorPaletteModal(props: ColorPaletteModalProps) {
  return (
    <EntityFormModal {...props} entityName="Color Palette" size="lg">
      {(formProps) => <ColorPaletteForm {...formProps} />}
    </EntityFormModal>
  );
}
