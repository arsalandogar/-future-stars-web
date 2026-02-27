import { api } from '@/lib/api-client';
import { createMutation } from '@/lib/react-query';

interface UploadCardImageParams {
  image: Blob;
  name: string;
  category: 'user-card';
}

export const useUploadCardImage = createMutation({
  mutationFn: async (params: UploadCardImageParams): Promise<string> => {
    const formData = new FormData();
    formData.append('image', params.image, params.name);
    formData.append('name', params.name);
    formData.append('category', params.category);
    const response: { data: { url: string } } = await api.post(
      'images/upload',
      formData
    );
    return response.data.url;
  },
});
