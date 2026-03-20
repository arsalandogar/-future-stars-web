import {
  Stack,
  Switch,
  Group,
  ActionIcon,
  Text,
  Paper,
  Button,
  Box,
  Grid,
  ColorInput,
} from '@mantine/core';
import { revalidateLogic } from '@tanstack/react-form';
import { Plus, Trash2 } from 'lucide-react';

import { useAppForm } from '@/lib/form';

import { useCreateColorPalette } from '../api/create-color-palette';
import { useUpdateColorPalette } from '../api/update-color-palette';
import { colorPaletteSchema } from '../utils/validation';
import type { ColorPalette, ColorPair } from '../types';

interface Props {
  item?: ColorPalette;
  modalClose: () => void;
}

const DEFAULT_COLOR_PAIR: ColorPair = {
  bg: '#5046FF',
  fg: '#FFFFFF',
  rank: 0,
};

export function ColorPaletteForm({ item, modalClose }: Props) {
  const createColorPalette = useCreateColorPalette();
  const updateColorPalette = useUpdateColorPalette();

  const defaultValues = {
    name: item?.name ?? '',
    colorPairs: item?.colorPairs ?? [{ ...DEFAULT_COLOR_PAIR }],
    isActive: item?.isActive ?? true,
  };

  const form = useAppForm({
    defaultValues,
    validators: {
      onDynamic: colorPaletteSchema,
    },
    validationLogic: revalidateLogic(),
    onSubmit: async ({ value }) => {
      const isEdit = !!item?.id;
      if (isEdit) {
        await updateColorPalette.mutateAsync({ id: item.id, ...value });
      } else {
        await createColorPalette.mutateAsync(value);
      }
      form.reset();
      modalClose();
    },
  });

  return (
    <form.AppForm>
      <form.Form>
        <Stack gap="xl">
          <form.AppField name="name">
            {(field) => (
              <field.TextField
                label="Palette Name"
                placeholder="e.g., Lakers"
                required
              />
            )}
          </form.AppField>

          <form.AppField name="colorPairs" mode="array">
            {(field) => (
              <Box>
                <Group justify="space-between" mb="xs">
                  <Text fw={600} size="sm">
                    Color Pairs
                  </Text>
                  <Text size="xs" c="dimmed">
                    {field.state.value.length} pair(s)
                  </Text>
                </Group>

                <Stack gap="md">
                  {field.state.value.map((_, index) => (
                    <Paper
                      key={`${index + 1}`}
                      p="md"
                      withBorder
                      shadow="sm"
                      radius="md"
                    >
                      <Group justify="space-between" mb="md">
                        <Text size="sm" fw={700}>
                          Pair #{index + 1}
                        </Text>
                        {field.state.value.length > 1 && (
                          <ActionIcon
                            color="red"
                            variant="light"
                            onClick={() => field.removeValue(index)}
                          >
                            <Trash2 size={16} />
                          </ActionIcon>
                        )}
                      </Group>

                      <Grid gutter="md">
                        <Grid.Col span={{ base: 12, sm: 5 }}>
                          <form.AppField name={`colorPairs[${index}].bg`}>
                            {(bgField) => (
                              <ColorInput
                                label="Background"
                                format="hex"
                                value={bgField.state.value}
                                onChange={bgField.handleChange}
                                placeholder="Pick color"
                                fixOnBlur
                              />
                            )}
                          </form.AppField>
                        </Grid.Col>

                        <Grid.Col span={{ base: 12, sm: 5 }}>
                          <form.AppField name={`colorPairs[${index}].fg`}>
                            {(fgField) => (
                              <ColorInput
                                label="Foreground"
                                format="hex"
                                value={fgField.state.value}
                                onChange={fgField.handleChange}
                                placeholder="Pick color"
                                fixOnBlur
                              />
                            )}
                          </form.AppField>
                        </Grid.Col>

                        <Grid.Col span={{ base: 12, sm: 2 }}>
                          <form.AppField name={`colorPairs[${index}].rank`}>
                            {(rankField) => (
                              <rankField.NumberInputField
                                label="Rank"
                                min={0}
                              />
                            )}
                          </form.AppField>
                        </Grid.Col>
                      </Grid>
                    </Paper>
                  ))}
                </Stack>

                <Button
                  variant="outline"
                  leftSection={<Plus size={16} />}
                  fullWidth
                  mt="md"
                  onClick={() =>
                    field.pushValue({
                      ...DEFAULT_COLOR_PAIR,
                      rank: field.state.value.length,
                    })
                  }
                >
                  Add Color Pair
                </Button>

                {field.state.meta.errors.length > 0 && (
                  <Text size="xs" c="red" mt="xs">
                    {field.state.meta.errors[0]?.message}
                  </Text>
                )}
              </Box>
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
            {item ? 'Save Changes' : 'Create Color Palette'}
          </form.SubmitButton>
        </Stack>
      </form.Form>
    </form.AppForm>
  );
}
