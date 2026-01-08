import { Stack, Switch } from '@mantine/core';
import { revalidateLogic } from '@tanstack/react-form';

import { useAppForm } from '@/lib/form';

import { useCreateColorLeague } from '../api/create-color-league';
import { useUpdateColorLeague } from '../api/update-color-league';
import { colorLeagueSchema } from '../utils/validation';
import type { ColorLeague } from '../types';

interface Props {
  item?: ColorLeague;
  modalClose: () => void;
}

export function ColorLeagueForm({ item, modalClose }: Props) {
  const createColorLeague = useCreateColorLeague();
  const updateColorLeague = useUpdateColorLeague();

  const defaultValues = {
    name: item?.name ?? '',
    label: item?.label ?? '',
    rank: item?.rank ?? 0,
    isActive: item?.isActive ?? false,
  };

  const form = useAppForm({
    defaultValues,
    validators: {
      onDynamic: colorLeagueSchema,
    },
    validationLogic: revalidateLogic(),
    onSubmit: async ({ value }) => {
      const isEdit = !!item?.id;

      if (isEdit) {
        await updateColorLeague.mutateAsync({ id: item.id, ...value });
      } else {
        await createColorLeague.mutateAsync(value);
      }

      form.reset();
      modalClose();
    },
  });

  return (
    <form.AppForm>
      <form.Form>
        <Stack gap="md">
          <form.AppField name="name">
            {(field) => (
              <field.TextField label="Name" placeholder="e.g., gold" required />
            )}
          </form.AppField>

          <form.AppField name="label">
            {(field) => (
              <field.TextField
                label="Label"
                placeholder="e.g., Gold League"
                required
              />
            )}
          </form.AppField>

          <form.AppField name="rank">
            {(field) => (
              <field.NumberInputField
                label="Rank"
                placeholder="0"
                min={0}
                required
              />
            )}
          </form.AppField>

          <form.AppField name="isActive">
            {(field) => (
              <Switch
                label="Active"
                checked={field.state.value}
                onChange={(e) => field.handleChange(e.currentTarget.checked)}
              />
            )}
          </form.AppField>

          <form.SubmitButton>
            {item ? 'Update Color League' : 'Create Color League'}
          </form.SubmitButton>
        </Stack>
      </form.Form>
    </form.AppForm>
  );
}
