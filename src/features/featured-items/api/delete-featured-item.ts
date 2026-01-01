import { createMutation, invalidateQueries } from '@/lib/react-query';
import { api } from '@/lib/api-client';
import { useFeaturedItems } from './get-featured-items';
import { notifications } from '@mantine/notifications';

export const useDeleteFeaturedItem = createMutation({
  mutationFn: (id: string | number): Promise<void> =>
    api.delete(`admin/featured-items/${id}`),
  use: [invalidateQueries([useFeaturedItems.getKey()])],
  onSuccess: () => {
    notifications.show({
      title: 'Featured Item Deleted',
      message: 'Featured Item has been deleted successfully.',
      color: 'green',
    });
  },
});
