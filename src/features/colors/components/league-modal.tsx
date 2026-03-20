import { EntityFormModal } from '@/components/ui/entity-form-modal';

import type { League } from '../types';
import { LeagueForm } from './league-form';

type LeagueModalProps = {
  item: League | undefined;
  opened: boolean;
  onClose: () => void;
};

export function LeagueModal(props: LeagueModalProps) {
  return (
    <EntityFormModal {...props} entityName="League">
      {(formProps) => <LeagueForm {...formProps} />}
    </EntityFormModal>
  );
}
