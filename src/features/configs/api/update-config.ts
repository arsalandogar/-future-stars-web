import { notifications } from '@mantine/notifications';

import { api } from '@/lib/api-client';
import { createMutation, invalidateQueries } from '@/lib/react-query';

import { useConfigs } from './get-configs';
import type { Config, UpdateConfigParams, CreateConfigParams } from '../types';

export const useUpdateConfig = createMutation({
  mutationFn: ({
    name,
    value,
    description,
  }: UpdateConfigParams): Promise<Config> =>
    api.put(`admin/configs/${name}`, { value, description }),
  use: [invalidateQueries([useConfigs.getKey()])],
  onSuccess: () => {
    notifications.show({
      title: 'Config updated',
      message: 'Configuration has been saved successfully.',
      color: 'green',
    });
  },
});

export const useCreateConfig = createMutation({
  mutationFn: ({
    name,
    value,
    description,
  }: CreateConfigParams): Promise<Config> =>
    api.post('admin/configs', { name, value, description }),
  use: [invalidateQueries([useConfigs.getKey()])],
  onSuccess: () => {
    notifications.show({
      title: 'Config created',
      message: 'Configuration has been created successfully.',
      color: 'green',
    });
  },
});
