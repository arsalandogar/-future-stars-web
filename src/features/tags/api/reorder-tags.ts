import type { Tag } from '@/types';

import { api } from '@/lib/api-client';
import { createMutation, invalidateQueries } from '@/lib/react-query';

import { useTags } from './get-tags';

export const useReorderTags = createMutation({
  mutationFn: (tagIds: number[]): Promise<Tag[]> =>
    api.patch('admin/tags/reorder', { tagIds }),
  use: [invalidateQueries([useTags.getKey()])],
});
