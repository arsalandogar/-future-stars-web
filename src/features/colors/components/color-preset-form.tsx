import { Stack, Switch, TagsInput, Group, ColorSwatch } from '@mantine/core';
import { revalidateLogic } from '@tanstack/react-form';

import { useAppForm } from '@/lib/form';

import { useCreateColorPreset } from '../api/create-color-preset';
import { useUpdateColorPreset } from '../api/update-color-preset';
import { useColorLeagues } from '../api/get-color-leagues';
import { colorPresetSchema } from '../utils/validation';
import type { ColorPreset } from '../types';

interface Props {
  item?: ColorPreset;
  modalClose: () => void;
}

export function ColorPresetForm({ item, modalClose }: Props) {
  const createColorPreset = useCreateColorPreset();
  const updateColorPreset = useUpdateColorPreset();
  const { data } = useColorLeagues();

  const colorLeagues = data?.data ?? [];

  const leagueOptions =
    colorLeagues.map((league) => ({
      value: String(league.id),
      label: league.label,
    })) ?? [];

  const defaultValues = {
    colorLeagueId: item?.colorLeagueId ?? null,
    name: item?.name ?? '',
    abbreviation: item?.abbreviation ?? '',
    colors: item?.colors ?? [],
    rank: item?.rank ?? 0,
    isFeatured: item?.isFeatured ?? false,
    isActive: item?.isActive ?? true,
  };

  const form = useAppForm({
    defaultValues,
    validators: {
      onDynamic: colorPresetSchema,
    },
    validationLogic: revalidateLogic(),
    onSubmit: async ({ value }) => {
      const isEdit = !!item?.id;

      const data = {
        ...value,
        colorLeagueId: value.colorLeagueId!,
      };

      if (isEdit) {
        await updateColorPreset.mutateAsync({ id: item.id, ...data });
      } else {
        await createColorPreset.mutateAsync(data);
      }

      form.reset();
      modalClose();
    },
  });

  return (
    <form.AppForm>
      <form.Form>
        <Stack gap="md">
          <form.AppField name="colorLeagueId">
            {(field) => (
              <field.SelectField
                valueAs="number"
                label="Color League"
                placeholder="Select color league"
                data={leagueOptions}
                searchable
                required
              />
            )}
          </form.AppField>

          <form.AppField name="name">
            {(field) => (
              <field.TextField
                label="Name"
                placeholder="e.g., Royal Blue"
                required
              />
            )}
          </form.AppField>

          <form.AppField name="abbreviation">
            {(field) => (
              <field.TextField
                label="Abbreviation"
                placeholder="e.g., RB"
                required
              />
            )}
          </form.AppField>

          <form.AppField name="colors">
            {(field) => (
              <div>
                <TagsInput
                  label="Colors"
                  placeholder="Enter hex color and press Enter"
                  value={field.state.value}
                  onChange={(value) => field.handleChange(value)}
                  error={
                    field.state.meta.isTouched &&
                    field.state.meta.errors.length > 0
                      ? field.state.meta.errors[0]?.message
                      : undefined
                  }
                  required
                />
                {field.state.value.length > 0 && (
                  <Group gap="xs" mt="xs">
                    {field.state.value.map((color) => (
                      <ColorSwatch key={color} color={color} size={24} />
                    ))}
                  </Group>
                )}
              </div>
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
            {item ? 'Update Color Preset' : 'Create Color Preset'}
          </form.SubmitButton>
        </Stack>
      </form.Form>
    </form.AppForm>
  );
}
