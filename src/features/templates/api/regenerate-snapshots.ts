import { notifications } from '@mantine/notifications';

import { api } from '@/lib/api-client';
import { createMutation, invalidateQueries } from '@/lib/react-query';

import { useTemplates } from './get-templates';

interface RegenerateSnapshotsParams {
  templateId?: number;
  force?: boolean;
}

interface RegenerateResult {
  id: number;
  name: string;
  status: 'queued' | 'skipped' | 'no_svg' | 'queue_failed';
}

interface RegenerateSnapshotsResponse {
  data: {
    summary: {
      queued: number;
      skipped: number;
      total: number;
    };
    results: RegenerateResult[];
  };
}

export const useRegenerateSnapshots = createMutation({
  mutationFn: (
    params: RegenerateSnapshotsParams
  ): Promise<RegenerateSnapshotsResponse> =>
    api.post('admin/templates/regenerate-snapshots', null, { params }),
  use: [invalidateQueries([useTemplates.getKey()])],
  onSuccess: (data) => {
    const { queued, skipped, total } = data.data.summary;
    notifications.show({
      title: 'Snapshot regeneration started',
      message: `${queued} of ${total} templates queued (${skipped} skipped).`,
      color: 'green',
    });
  },
  onError: () => {
    notifications.show({
      title: 'Snapshot regeneration failed',
      message: 'Something went wrong. Please try again.',
      color: 'red',
    });
  },
});
