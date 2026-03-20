import { Stack, Switch } from '@mantine/core';
import { revalidateLogic } from '@tanstack/react-form';

import { useAppForm } from '@/lib/form';

import { useCreateLeague } from '../api/create-league';
import { useUpdateLeague } from '../api/update-league';
import { leagueSchema } from '../utils/validation';
import type { League } from '../types';

interface Props {
  item?: League;
  modalClose: () => void;
}

export function LeagueForm({ item, modalClose }: Props) {
  const createLeague = useCreateLeague();
  const updateLeague = useUpdateLeague();

  const defaultValues = {
    name: item?.name ?? '',
    label: item?.label ?? '',
    rank: item?.rank ?? 0,
    isActive: item?.isActive ?? false,
  };

  const form = useAppForm({
    defaultValues,
    validators: {
      onDynamic: leagueSchema,
    },
    validationLogic: revalidateLogic(),
    onSubmit: async ({ value }) => {
      const isEdit = !!item?.id;

      if (isEdit) {
        await updateLeague.mutateAsync({ id: item.id, ...value });
      } else {
        await createLeague.mutateAsync(value);
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
            {item ? 'Update League' : 'Create League'}
          </form.SubmitButton>
        </Stack>
      </form.Form>
    </form.AppForm>
  );
}
