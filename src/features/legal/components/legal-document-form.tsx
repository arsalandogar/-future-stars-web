import { Stack } from '@mantine/core';
import { revalidateLogic } from '@tanstack/react-form';

import { useAppForm } from '@/lib/form';

import { legalDocumentSchema } from '../utils/validation';

interface LegalDocumentFormProps {
  initialValues?: {
    version: string;
    content: string;
  };
  onSubmit: (values: { version: string; content: string }) => void;
  submitLabel?: string;
}

export function LegalDocumentForm({
  initialValues,
  onSubmit,
  submitLabel = 'Save',
}: LegalDocumentFormProps) {
  const form = useAppForm({
    defaultValues: {
      version: initialValues?.version ?? '',
      content: initialValues?.content ?? '',
    },
    validators: {
      onDynamic: legalDocumentSchema,
    },
    validationLogic: revalidateLogic(),
    onSubmit: ({ value }) => {
      onSubmit(value);
    },
  });

  return (
    <form.AppForm>
      <form.Form>
        <Stack gap="md">
          <form.AppField name="version">
            {(field) => (
              <field.TextField
                label="Version"
                placeholder="e.g., 1.0.0"
                required
                maxLength={20}
              />
            )}
          </form.AppField>

          <form.AppField name="content">
            {(field) => (
              <field.TextareaField
                label="Content"
                placeholder="Enter the document content (HTML supported)"
                required
                minRows={15}
                autosize
              />
            )}
          </form.AppField>

          <form.SubmitButton>{submitLabel}</form.SubmitButton>
        </Stack>
      </form.Form>
    </form.AppForm>
  );
}
