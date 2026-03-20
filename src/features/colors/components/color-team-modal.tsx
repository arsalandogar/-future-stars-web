import { EntityFormModal } from '@/components/ui/entity-form-modal';

import type { ColorTeam, PaletteOption } from '../types';
import { ColorTeamForm } from './color-team-form';

type ColorTeamModalProps = {
  item: ColorTeam | undefined;
  paletteOptions: PaletteOption[];
  opened: boolean;
  onClose: () => void;
};

export function ColorTeamModal({
  paletteOptions,
  ...props
}: ColorTeamModalProps) {
  return (
    <EntityFormModal {...props} entityName="Color Team" size="md">
      {(formProps) => (
        <ColorTeamForm {...formProps} paletteOptions={paletteOptions} />
      )}
    </EntityFormModal>
  );
}
