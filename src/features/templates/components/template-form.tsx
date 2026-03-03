import {
  Badge,
  Box,
  Button,
  Card,
  Group,
  Image,
  Radio,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from '@mantine/core';

import { useTags } from '@/features/tags';
import { useTemplateTypes } from '@/features/template-types';

import { useTemplates } from '../api/get-templates';
import type { TemplateFormValues } from '../types';
import { useTemplateForm } from './template-form-context';

interface TemplateFormProps {
  initialValues?: Partial<TemplateFormValues>;
  onSubmit: (values: TemplateFormValues) => void | Promise<void>;
  submitLabel?: string;
  onCancel?: () => void;
}

const SIDE_OPTIONS = [
  { value: 'front', label: 'Front' },
  { value: 'back', label: 'Back' },
];

export function TemplateForm({
  initialValues,
  onSubmit,
  submitLabel = 'Save',
  onCancel,
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

  const defaultBackTemplate = backTemplates.find((t) => t.isDefaultBack);

  const form = useTemplateForm(initialValues, onSubmit);

  return (
    <form.AppForm>
      <form.Form blockOnUnsavedChanges>
        <Stack gap="lg">
          {/* Section 1: Basic Information */}
          <Card withBorder radius="md" p="lg">
            <Group justify="space-between" mb="md">
              <Title order={5}>Basic Information</Title>
              <form.Subscribe selector={(state) => state.isDirty}>
                {(isDirty) =>
                  isDirty && (
                    <Badge color="yellow" variant="light" size="sm">
                      Unsaved changes
                    </Badge>
                  )
                }
              </form.Subscribe>
            </Group>

            <Stack gap="md">
              <SimpleGrid cols={{ base: 1, sm: 2 }}>
                <form.AppField name="side">
                  {(field) => (
                    <field.SelectField
                      label="Side"
                      data={SIDE_OPTIONS}
                      required
                    />
                  )}
                </form.AppField>

                <form.AppField name="templateTypeId">
                  {(field) => (
                    <field.SelectField
                      valueAs="number"
                      label="Template Type"
                      data={templateTypeOptions}
                      placeholder="Select template type"
                      required
                    />
                  )}
                </form.AppField>
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
                    minRows={4}
                    autosize
                    maxRows={8}
                    maxLength={1000}
                  />
                )}
              </form.AppField>

              <form.AppField name="tagIds">
                {(field) => (
                  <field.SelectField
                    multi
                    valueAs="number"
                    label="Tags"
                    data={tagOptions}
                    placeholder="Select tags"
                    searchable
                    clearable
                  />
                )}
              </form.AppField>

              <form.AppField name="isPublished">
                {(field) => (
                  <field.CheckboxField
                    label="Published"
                    description="Make this template available for use"
                  />
                )}
              </form.AppField>
            </Stack>
          </Card>

          {/* Section 2: Set as Default Back Template - only for back templates */}
          <form.Subscribe selector={(state) => state.values.side}>
            {(side) =>
              side === 'back' && (
                <Card withBorder radius="md" p="lg">
                  <Title order={5} mb="md">
                    Default Settings
                  </Title>
                  <form.AppField name="isDefaultBack">
                    {(field) => (
                      <field.CheckboxField
                        label="Set as Default Back Template"
                        description="This template will be used as the default back template for front templates"
                      />
                    )}
                  </form.AppField>
                </Card>
              )
            }
          </form.Subscribe>

          {/* Section 4: Back Template - only for front templates */}
          <form.Subscribe
            selector={(state) => ({
              side: state.values.side,
              backTemplateMode: state.values.backTemplateMode,
              backTemplateId: state.values.backTemplateId,
            })}
          >
            {({ side, backTemplateMode, backTemplateId }) => {
              const selectedTemplate =
                backTemplateMode === 'default'
                  ? defaultBackTemplate
                  : backTemplates.find((t) => t.id === backTemplateId);

              return (
                side === 'front' && (
                  <Card withBorder radius="md" p="lg">
                    <div className="flex items-start justify-between gap-6">
                      <div className="flex-1">
                        <Title order={5} mb="md">
                          Back Template
                        </Title>

                        <Stack gap="md">
                          <form.AppField name="backTemplateMode">
                            {(field) => (
                              <field.RadioGroupField>
                                <Radio
                                  value="default"
                                  label="Use default back template"
                                  description={
                                    defaultBackTemplate
                                      ? `Will use "${defaultBackTemplate.label}"`
                                      : 'No default back template has been set'
                                  }
                                />
                                <Radio
                                  value="custom"
                                  label="Select a back template"
                                />
                              </field.RadioGroupField>
                            )}
                          </form.AppField>

                          {backTemplateMode === 'custom' && (
                            <form.AppField name="backTemplateId">
                              {(field) => (
                                <field.TemplateSelectField
                                  templates={backTemplates}
                                  placeholder="Choose a specific back template"
                                  clearable
                                  searchable
                                />
                              )}
                            </form.AppField>
                          )}
                        </Stack>
                      </div>

                      <Box className="w-28 shrink-0">
                        <Box className="aspect-3/4 overflow-hidden rounded-md border p-1">
                          {selectedTemplate ? (
                            <Image
                              src={selectedTemplate.templateImageMedium}
                              alt={selectedTemplate.label}
                              fit="contain"
                              className="h-full w-full"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <Text size="xs" c="dimmed" ta="center" px="xs">
                                No template
                              </Text>
                            </div>
                          )}
                        </Box>
                      </Box>
                    </div>
                  </Card>
                )
              );
            }}
          </form.Subscribe>

          {/* Action buttons */}
          <Group justify="flex-end" gap="sm">
            {onCancel && (
              <Button variant="default" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <form.SubmitButton>{submitLabel}</form.SubmitButton>
          </Group>
        </Stack>
      </form.Form>
    </form.AppForm>
  );
}
