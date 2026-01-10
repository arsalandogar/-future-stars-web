import {
  Badge,
  Button,
  Card,
  Group,
  SimpleGrid,
  Stack,
  Title,
} from '@mantine/core';
import { Plus } from 'lucide-react';

import { useTags } from '@/features/tags';
import { useTemplateTypes } from '@/features/template-types';

import { useTemplates } from '../api/get-templates';
import type { TemplateFormValues } from '../types';
import { AttributesTable } from './attributes-table';
import { TemplateCodeSection } from './template-code-section';
import { useTemplateForm, DEFAULT_ATTRIBUTE } from './template-form-context';
import { TemplatePreviewPanel } from './template-preview-panel';

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
        <div className="flex gap-6">
          {/* Left column - scrollable form */}
          <div className="flex-1 min-w-0">
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

              {/* Section 2: Template Code */}
              <TemplateCodeSection />

              {/* Section 3: Set as Default Back Template - only for back templates */}
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
                  useDefaultBack: state.values.useDefaultBack,
                })}
              >
                {({ side, useDefaultBack }) =>
                  side === 'front' && (
                    <Card withBorder radius="md" p="lg">
                      <Title order={5} mb="md">
                        Back Template
                      </Title>
                      <Stack gap="md">
                        <form.AppField name="useDefaultBack">
                          {(field) => (
                            <field.CheckboxField
                              label="Use Default Back Template"
                              description={
                                defaultBackTemplate
                                  ? `Will use "${defaultBackTemplate.label}" as the back template`
                                  : 'No default back template has been set'
                              }
                            />
                          )}
                        </form.AppField>

                        {!useDefaultBack && (
                          <form.AppField name="backTemplateId">
                            {(field) => (
                              <field.TemplateSelectField
                                label="Select Back Template"
                                templates={backTemplates}
                                placeholder="Choose a specific back template"
                                clearable
                                searchable
                              />
                            )}
                          </form.AppField>
                        )}
                      </Stack>
                    </Card>
                  )
                }
              </form.Subscribe>

              {/* Section 5: Attributes */}
              <Card withBorder radius="md" p="lg">
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
                    <AttributesTable
                      mode="edit"
                      attributes={arrayField.state.value}
                      onRemove={(index) => arrayField.removeValue(index)}
                    />
                  )}
                </form.Field>
              </Card>

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
          </div>

          {/* Right column - sticky preview (desktop only) */}
          <div className="hidden lg:block w-87.5 shrink-0">
            <div className="sticky top-4">
              <form.Subscribe selector={(state) => state.values.svgString}>
                {(svgString) => <TemplatePreviewPanel svgString={svgString} />}
              </form.Subscribe>
            </div>
          </div>
        </div>
      </form.Form>
    </form.AppForm>
  );
}
