import {
  ActionIcon,
  Box,
  Button,
  Card,
  Group,
  MultiSelect,
  Select,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  Title,
} from '@mantine/core';
import { revalidateLogic } from '@tanstack/react-form';
import { Plus, Trash2 } from 'lucide-react';

import { SvgPreview } from '@/components/svg-preview';
import { useAppForm } from '@/lib/form';
import { useTags } from '@/features/tags';
import { useTemplateTypes } from '@/features/template-types';

import { useTemplates } from '../api/get-templates';
import { templateFormSchema } from '../utils/validation';
import type {
  TemplateFormValues,
  TemplateAttributeFormValues,
  TemplateAttributeType,
} from '../types';

interface TemplateFormProps {
  initialValues?: Partial<TemplateFormValues>;
  onSubmit: (values: TemplateFormValues) => void;
  submitLabel?: string;
}

const DEFAULT_ATTRIBUTE: TemplateAttributeFormValues = {
  type: 'string',
  name: '',
  label: '',
  defaultValue: '',
  defaultColor: '',
};

const SIDE_OPTIONS = [
  { value: 'front', label: 'Front' },
  { value: 'back', label: 'Back' },
];

const ATTRIBUTE_TYPE_OPTIONS: {
  value: TemplateAttributeType;
  label: string;
}[] = [
  { value: 'string', label: 'String' },
  { value: 'color', label: 'Color' },
  { value: 'image', label: 'Image' },
];

const COLOR_SWATCHES = [
  '#000000',
  '#FFFFFF',
  '#FF0000',
  '#00FF00',
  '#0000FF',
  '#FFFF00',
  '#FF00FF',
  '#00FFFF',
];

export function TemplateForm({
  initialValues,
  onSubmit,
  submitLabel = 'Save',
}: TemplateFormProps) {
  const { data: tagsResponse } = useTags({ variables: {} });
  const { data: templateTypesResponse } = useTemplateTypes({});
  const { data: backTemplatesResponse } = useTemplates({
    variables: { limit: 100, side: 'back' },
  });

  const tags = tagsResponse?.data ?? [];
  const templateTypes = templateTypesResponse?.data ?? [];
  const backTemplates = backTemplatesResponse?.data ?? [];

  const tagOptions = tags.map((tag) => ({
    value: String(tag.id),
    label: tag.label,
  }));

  const templateTypeOptions = templateTypes.map((type) => ({
    value: String(type.id),
    label: type.name,
  }));

  const backTemplateOptions = backTemplates.map((t) => ({
    value: String(t.id),
    label: t.label,
  }));

  const form = useAppForm({
    defaultValues: {
      side: initialValues?.side ?? 'front',
      name: initialValues?.name ?? '',
      label: initialValues?.label ?? '',
      description: initialValues?.description ?? '',
      svgString: initialValues?.svgString ?? '',
      templateTypeId: initialValues?.templateTypeId ?? null,
      backTemplateId: initialValues?.backTemplateId ?? null,
      tagIds: initialValues?.tagIds ?? [],
      attributes: initialValues?.attributes ?? [],
    },
    validators: {
      onDynamic: templateFormSchema,
    },
    validationLogic: revalidateLogic(),
    onSubmit: ({ value }) => {
      onSubmit(value as TemplateFormValues);
    },
  });

  return (
    <form.AppForm>
      <form.Form>
        <Stack gap="lg">
          {/* Basic Info */}
          <SimpleGrid cols={{ base: 1, sm: 2 }}>
            <form.AppField name="side">
              {(field) => (
                <field.SelectField label="Side" data={SIDE_OPTIONS} required />
              )}
            </form.AppField>

            <form.Field name="templateTypeId">
              {(field) => (
                <Select
                  label="Template Type"
                  data={templateTypeOptions}
                  placeholder="Select template type"
                  required
                  value={
                    field.state.value !== null
                      ? String(field.state.value)
                      : null
                  }
                  onChange={(value) =>
                    field.handleChange(value ? Number(value) : null)
                  }
                  error={
                    (
                      field.state.meta.errors[0] as
                        | { message: string }
                        | undefined
                    )?.message
                  }
                />
              )}
            </form.Field>
          </SimpleGrid>

          <SimpleGrid cols={{ base: 1, sm: 2 }}>
            <form.AppField name="name">
              {(field) => (
                <field.TextField
                  label="Name"
                  placeholder="e.g., jersey-front-v1"
                  required
                  maxLength={255}
                />
              )}
            </form.AppField>

            <form.AppField name="label">
              {(field) => (
                <field.TextField
                  label="Label"
                  placeholder="e.g., Jersey Front Template v1"
                  required
                  maxLength={255}
                />
              )}
            </form.AppField>
          </SimpleGrid>

          <form.AppField name="description">
            {(field) => (
              <field.TextareaField
                label="Description"
                placeholder="Optional description for this template"
                minRows={2}
                maxLength={1000}
              />
            )}
          </form.AppField>

          {/* SVG Input with Live Preview */}
          <Card withBorder p="md">
            <Title order={5} mb="md">
              SVG Template
            </Title>
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
              <form.Field name="svgString">
                {(field) => (
                  <Textarea
                    label="SVG String"
                    placeholder="Paste SVG markup here..."
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    rows={10}
                    styles={{
                      input: {
                        fontFamily: 'monospace',
                        fontSize: '12px',
                        height: '250px',
                        resize: 'none',
                      },
                    }}
                  />
                )}
              </form.Field>

              <Box>
                <Text size="sm" fw={500} mb="xs">
                  Preview
                </Text>
                <form.Subscribe selector={(state) => state.values.svgString}>
                  {(svgString) => (
                    <SvgPreview
                      svgString={svgString}
                      height={250}
                      className="rounded-md border p-2"
                      emptyMessage="Paste SVG to see preview"
                    />
                  )}
                </form.Subscribe>
              </Box>
            </SimpleGrid>
          </Card>

          {/* Tags */}
          <form.Field name="tagIds">
            {(field) => (
              <MultiSelect
                label="Tags"
                data={tagOptions}
                value={field.state.value}
                onChange={(value) => field.handleChange(value)}
                placeholder="Select tags"
                searchable
                clearable
              />
            )}
          </form.Field>

          {/* Back Template - only show for front templates */}
          <form.Subscribe selector={(state) => state.values.side}>
            {(side) =>
              side === 'front' && (
                <form.Field name="backTemplateId">
                  {(field) => (
                    <Select
                      label="Back Template"
                      description="Link a back template to this front template"
                      data={backTemplateOptions}
                      placeholder="Select back template (optional)"
                      value={
                        field.state.value !== null
                          ? String(field.state.value)
                          : null
                      }
                      onChange={(value) =>
                        field.handleChange(value ? Number(value) : null)
                      }
                      clearable
                      searchable
                    />
                  )}
                </form.Field>
              )
            }
          </form.Subscribe>

          {/* Dynamic Attributes */}
          <Card withBorder p="md">
            <Group justify="space-between" mb="md">
              <Title order={5}>Attributes</Title>
              <form.Field name="attributes" mode="array">
                {(field) => (
                  <Button
                    variant="light"
                    size="xs"
                    leftSection={<Plus size={14} />}
                    onClick={() => field.pushValue(DEFAULT_ATTRIBUTE)}
                  >
                    Add Attribute
                  </Button>
                )}
              </form.Field>
            </Group>

            <form.Field name="attributes" mode="array">
              {(arrayField) => (
                <>
                  {arrayField.state.value.length === 0 ? (
                    <Text size="sm" c="dimmed">
                      No attributes added yet.
                    </Text>
                  ) : (
                    <Stack gap="sm">
                      {arrayField.state.value.map((attr, index) => (
                        <Card key={index} withBorder p="sm">
                          <Group align="flex-start" wrap="nowrap">
                            <SimpleGrid
                              cols={{
                                base: 2,
                                sm: attr.type === 'string' ? 5 : 4,
                              }}
                              className="flex-1"
                            >
                              <form.Field name={`attributes[${index}].type`}>
                                {(field) => (
                                  <Select
                                    label="Type"
                                    data={ATTRIBUTE_TYPE_OPTIONS}
                                    value={field.state.value as string}
                                    onChange={(value) =>
                                      field.handleChange(
                                        value as TemplateAttributeType
                                      )
                                    }
                                    size="sm"
                                    required
                                  />
                                )}
                              </form.Field>

                              <form.AppField name={`attributes[${index}].name`}>
                                {(field) => (
                                  <field.TextField
                                    label="Name"
                                    size="sm"
                                    required
                                  />
                                )}
                              </form.AppField>

                              <form.AppField
                                name={`attributes[${index}].label`}
                              >
                                {(field) => (
                                  <field.TextField
                                    label="Label"
                                    size="sm"
                                    required
                                  />
                                )}
                              </form.AppField>

                              {attr.type === 'color' ? (
                                <form.AppField
                                  name={`attributes[${index}].defaultValue`}
                                >
                                  {(field) => (
                                    <field.ColorInputField
                                      label="Default Value"
                                      size="sm"
                                      format="hex"
                                      swatches={COLOR_SWATCHES}
                                    />
                                  )}
                                </form.AppField>
                              ) : (
                                <form.AppField
                                  name={`attributes[${index}].defaultValue`}
                                >
                                  {(field) => (
                                    <field.TextField
                                      label="Default Value"
                                      size="sm"
                                    />
                                  )}
                                </form.AppField>
                              )}

                              {attr.type === 'string' && (
                                <form.AppField
                                  name={`attributes[${index}].defaultColor`}
                                >
                                  {(field) => (
                                    <field.ColorInputField
                                      label="Default Color (Text)"
                                      size="sm"
                                      format="hex"
                                      swatches={COLOR_SWATCHES}
                                    />
                                  )}
                                </form.AppField>
                              )}
                            </SimpleGrid>

                            <ActionIcon
                              variant="subtle"
                              color="red"
                              mt={28}
                              onClick={() => arrayField.removeValue(index)}
                              aria-label="Remove attribute"
                            >
                              <Trash2 size={16} />
                            </ActionIcon>
                          </Group>
                        </Card>
                      ))}
                    </Stack>
                  )}
                </>
              )}
            </form.Field>
          </Card>

          <form.SubmitButton>{submitLabel}</form.SubmitButton>
        </Stack>
      </form.Form>
    </form.AppForm>
  );
}
