import { api } from '@/lib/api-client';
import { useQueryClient } from '@tanstack/react-query';
import { createMutation } from 'react-query-kit';
import { tagKeys } from './get-tags';

export const useDeleteTag = createMutation({
  mutationFn: (id: string | number): Promise<void> => api.delete(`tags/${id}`),
});

export function useDeleteTagWithInvalidation() {
  const queryClient = useQueryClient();

  return useDeleteTag({
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: tagKeys.all });
    },
  });
}
