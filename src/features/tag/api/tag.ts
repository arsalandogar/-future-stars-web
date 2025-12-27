// features/tags/api/use-tags-crud.ts
import { createQuery, createMutation } from '@/lib/react-query';
import { api } from '@/lib/api-client';
import type { Tag } from '../types';
import { useQueryClient } from '@tanstack/react-query';

export const tagKeys = {
  all: ['tags'] as const,
};

export type TagInput = Omit<
  Tag,
  'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'
>;

// Fetch all tags
export const useTags = createQuery({
  queryKey: tagKeys.all,
  fetcher: (): Promise<Tag[]> => api.get('tags'),
});

// Create tag
export const useCreateTag = createMutation({
  mutationFn: (newTag: TagInput): Promise<Tag> => api.post('tags', newTag),
});

// Update tag
export const useUpdateTag = createMutation({
  mutationFn: ({
    id,
    updatedTag,
  }: {
    id: string;
    updatedTag: TagInput;
  }): Promise<Tag> => api.put(`tags/${id}`, updatedTag),
});

// Delete tag
export const useDeleteTag = createMutation({
  mutationFn: (id: string | number): Promise<void> => api.delete(`tags/${id}`),
});

// ✅ Composite hook with auto-invalidation
export const useTagsMutations = () => {
  const queryClient = useQueryClient();

  const createMutation = useCreateTag({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagKeys.all });
    },
  });

  const updateMutation = useUpdateTag({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagKeys.all });
    },
  });

  const deleteMutation = useDeleteTag({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagKeys.all });
    },
  });

  return {
    createTag: createMutation,
    updateTag: updateMutation,
    deleteTag: deleteMutation,
  };
};
