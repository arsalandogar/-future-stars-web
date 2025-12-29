import { createMutation } from 'react-query-kit';
import type { Tag, TagInput } from '../types';
import { api } from '@/lib/api-client';
import { useQueryClient } from '@tanstack/react-query';
import { tagKeys } from './get-tags';

export const useUpdateTag = createMutation({
  mutationFn: ({
    id,
    updatedTag,
  }: {
    id: string;
    updatedTag: TagInput;
  }): Promise<Tag> => api.put(`tags/${id}`, updatedTag),
});

export function useUpdateTagWithInvalidation() {
  const queryClient = useQueryClient();

  return useUpdateTag({
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: tagKeys.all });
    },
  });
}
