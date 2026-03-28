import { api } from '@/lib/api-client';
import { createMutation } from '@/lib/react-query';

export const useReorderTemplates = createMutation({
  mutationFn: (templateIds: number[]): Promise<unknown> =>
    api.put('admin/templates/reorder', { templateIds }),
});
