import { createMutation, invalidateQueries } from '@/lib/react-query';
import { api } from '@/lib/api-client';
import { useFeaturedItems } from './get-featured-items';
import type { FeaturedItem, UpdateFeaturedItemParam } from '../types';
import { notifications } from '@mantine/notifications';

export const useUpdateFeaturedItem = createMutation({
  mutationFn: ({
    id,
    title,
    description,
    ctaText,
    image,
    displayOrder,
    isActive,
    templateId,
  }: UpdateFeaturedItemParam): Promise<FeaturedItem> => {
    const formData = new FormData();
    Object.entries({
      title,
      description,
      ctaText,
      image,
      displayOrder,
      isActive,
      templateId,
    }).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value instanceof File ? value : String(value));
      }
    });

    return api.put(`admin/featured-items/${id}`, formData);
  },
  use: [invalidateQueries([useFeaturedItems.getKey()])],
  onSuccess: () => {
    notifications.show({
      title: 'Featured Item updated',
      message: 'Featured Item has been saved successfully.',
      color: 'green',
    });
  },
});
