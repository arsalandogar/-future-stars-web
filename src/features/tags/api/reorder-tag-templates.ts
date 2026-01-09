import type { Tag } from '@/types';

import { api } from '@/lib/api-client';
import { createMutation, invalidateQueries } from '@/lib/react-query';
import { useTag } from './get-tag';

interface ReorderTagTemplatesParams {
  tagId: number;
  templateIds: number[];
}

export const useReorderTagTemplates = createMutation({
  mutationFn: ({
    tagId,
    templateIds,
  }: ReorderTagTemplatesParams): Promise<Tag> =>
    api.patch(`admin/tags/${tagId}/templates/reorder`, { templateIds }),
  use: [invalidateQueries([useTag.getKey()])],
});
