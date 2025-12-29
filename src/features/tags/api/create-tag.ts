import { createMutation } from 'react-query-kit';
import type { Tag, TagInput } from '../types';
import { api } from '@/lib/api-client';
import { useQueryClient } from '@tanstack/react-query';
import { tagKeys } from './get-tags';

export const useCreateTag = createMutation({
  mutationFn: (newTag: TagInput): Promise<Tag> => api.post('tags', newTag),
});

export function useCreateTagWithInvalidation() {
  const queryClient = useQueryClient();

  return useCreateTag({
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: tagKeys.all });
    },
  });
}
