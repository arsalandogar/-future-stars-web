import { useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';

import { api } from '@/lib/api-client';
import { createMutation } from '@/lib/react-query';

import type { Config, UpdateConfigParams, CreateConfigParams } from '../types';

const useUpdateConfigMutation = createMutation({
  mutationFn: ({
    name,
    value,
    description,
  }: UpdateConfigParams): Promise<Config> =>
    api.put(`admin/configs/${name}`, { value, description }),
});

const useCreateConfigMutation = createMutation({
  mutationFn: ({
    name,
    value,
    description,
  }: CreateConfigParams): Promise<Config> =>
    api.post('admin/configs', { name, value, description }),
});

export function useUpdateConfig() {
  const queryClient = useQueryClient();

  return useUpdateConfigMutation({
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'configs'] });
      notifications.show({
        title: 'Config updated',
        message: 'Configuration has been saved successfully.',
        color: 'green',
      });
    },
  });
}

export function useCreateConfig() {
  const queryClient = useQueryClient();

  return useCreateConfigMutation({
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'configs'] });
      notifications.show({
        title: 'Config created',
        message: 'Configuration has been created successfully.',
        color: 'green',
      });
    },
  });
}
