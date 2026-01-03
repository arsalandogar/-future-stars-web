import {
  Box,
  Button,
  Group,
  MultiSelect,
  Select,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  Title,
} from '@mantine/core';
import { Plus } from 'lucide-react';

import { SvgPreview } from '@/components/svg-preview';
import { useTags } from '@/features/tags';
import { useTemplateTypes } from '@/features/template-types';

import { useTemplates } from '../api/get-templates';
import type { TemplateFormValues } from '../types';
import { AttributesTable } from './attributes-table';
import { useTemplateForm, DEFAULT_ATTRIBUTE } from './template-form-context';

interface TemplateFormProps {
  initialValues?: Partial<TemplateFormValues>;
  onSubmit: (values: TemplateFormValues) => void;
  submitLabel?: string;
}

const SIDE_OPTIONS = [
  { value: 'front', label: 'Front' },
  { value: 'back', label: 'Back' },
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

  const form = useTemplateForm(initialValues, onSubmit);

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
              <Text size="sm" fw={500} mb={4}>
                Preview
              </Text>
              <form.Subscribe selector={(state) => state.values.svgString}>
                {(svgString) => (
                  <SvgPreview
                    svgString={svgString}
                    height={250}
                    className="w-full rounded-md border p-2"
                    emptyMessage="Paste SVG to see preview"
                  />
                )}
              </form.Subscribe>
            </Box>
          </SimpleGrid>

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
          <Stack gap="sm">
            <Group justify="space-between">
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
          </Stack>

          <form.SubmitButton>{submitLabel}</form.SubmitButton>
        </Stack>
      </form.Form>
    </form.AppForm>
  );
}
