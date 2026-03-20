import { Stack, Switch, Group } from '@mantine/core';
import { revalidateLogic } from '@tanstack/react-form';

import { useAppForm } from '@/lib/form';

import { useCreateColorTeam } from '../api/create-color-team';
import { useUpdateColorTeam } from '../api/update-color-team';
import { useLeagues } from '../api/get-leagues';
import { colorTeamSchema } from '../utils/validation';
import type { ColorTeam, PaletteOption } from '../types';

interface Props {
  item?: ColorTeam;
  paletteOptions: PaletteOption[];
  modalClose: () => void;
}

export function ColorTeamForm({ item, paletteOptions, modalClose }: Props) {
  const createColorTeam = useCreateColorTeam();
  const updateColorTeam = useUpdateColorTeam();
  const { data: leaguesData } = useLeagues();

  const leagues = leaguesData?.data ?? [];

  const leagueOptions = leagues.map((league) => ({
    value: String(league.id),
    label: league.label,
  }));

  const defaultValues = {
    name: item?.name ?? '',
    abbreviation: item?.abbreviation ?? '',
    colorPaletteId: item?.colorPaletteId ?? null,
    leagueId: item?.leagueId ?? null,
    rank: item?.rank ?? 0,
    isFeatured: item?.isFeatured ?? false,
    isActive: item?.isActive ?? true,
  };

  const form = useAppForm({
    defaultValues,
    validators: {
      onDynamic: colorTeamSchema,
    },
    validationLogic: revalidateLogic(),
    onSubmit: async ({ value }) => {
      const isEdit = !!item?.id;

      const data = {
        ...value,
        colorPaletteId: value.colorPaletteId!,
      };

      if (isEdit) {
        await updateColorTeam.mutateAsync({ id: item.id, ...data });
      } else {
        await createColorTeam.mutateAsync(data);
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
              <field.TextField
                label="Name"
                placeholder="e.g., Lakers"
                required
              />
            )}
          </form.AppField>

          <form.AppField name="abbreviation">
            {(field) => (
              <field.TextField
                label="Abbreviation"
                placeholder="e.g., LAL"
                required
              />
            )}
          </form.AppField>

          <form.AppField name="colorPaletteId">
            {(field) => (
              <field.ColorPaletteSelectField
                label="Color Palette"
                placeholder="Select a color palette"
                colorPalettes={paletteOptions}
                searchable
                clearable
                nothingFoundMessage="No palettes found"
                required
              />
            )}
          </form.AppField>

          <form.AppField name="leagueId">
            {(field) => (
              <field.SelectField
                valueAs="number"
                label="League"
                placeholder="Select league (optional)"
                data={leagueOptions}
                searchable
                clearable
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

          <Group>
            <form.AppField name="isFeatured">
              {(field) => (
                <Switch
                  label="Featured"
                  checked={field.state.value}
                  onChange={(e) => field.handleChange(e.currentTarget.checked)}
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
          </Group>

          <form.SubmitButton>
            {item ? 'Update Color Team' : 'Create Color Team'}
          </form.SubmitButton>
        </Stack>
      </form.Form>
    </form.AppForm>
  );
}
