import { createMutation, invalidateQueries } from '@/lib/react-query';
import { api } from '@/lib/api-client';
import { useFeaturedItems } from './get-featured-items';
import type { FeaturedItem, CreateFeaturedItemParam } from '../types';
import { notifications } from '@mantine/notifications';

export const useCreateFeaturedItem = createMutation({
  mutationFn: ({
    title,
    description,
    ctaText,
    image,
    displayOrder,
    isActive,
    templateId,
  }: CreateFeaturedItemParam): Promise<FeaturedItem> => {
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

    return api.post('admin/featured-items', formData);
  },
  use: [invalidateQueries([useFeaturedItems.getKey()])],
  onSuccess: () => {
    notifications.show({
      title: 'Featured Item created',
      message: 'Featured Item has been created successfully.',
      color: 'green',
    });
  },
});
