import { Modal, Stack } from '@mantine/core';
import { revalidateLogic } from '@tanstack/react-form';

import { useAppForm } from '@/lib/form';
import { useTemplates } from '@/features/templates';

import { useAttachTemplatePalette } from '../api/attach-template-palette';
import { attachTemplateSchema } from '../utils/validation';

type AttachTemplateModalProps = {
  paletteId: number;
  opened: boolean;
  onClose: () => void;
};

export function AttachTemplateModal({
  paletteId,
  opened,
  onClose,
}: AttachTemplateModalProps) {
  const attachTemplate = useAttachTemplatePalette();
  const { data } = useTemplates({
    variables: { limit: 1000 },
    enabled: opened,
  });
  const templates = data?.data ?? [];

  const defaultValues = {
    templateId: null as number | null,
    rank: 0,
  };

  const form = useAppForm({
    defaultValues,
    validators: {
      onDynamic: attachTemplateSchema,
    },
    validationLogic: revalidateLogic(),
    onSubmit: async ({ value }) => {
      await attachTemplate.mutateAsync({
        paletteId,
        templateId: value.templateId!,
        rank: value.rank,
      });
      form.reset();
      onClose();
    },
  });

  const formKey = opened ? `attach-${paletteId}` : 'closed';

  return (
    <Modal
      key={formKey}
      opened={opened}
      onClose={onClose}
      title={<h2 className="font-bold">Attach Template</h2>}
    >
      <form.AppForm>
        <form.Form>
          <Stack gap="md">
            <form.AppField name="templateId">
              {(field) => (
                <field.TemplateSelectField
                  label="Template"
                  placeholder="Select a template"
                  templates={templates}
                  searchable
                  required
                />
              )}
            </form.AppField>

            <form.AppField name="rank">
              {(field) => (
                <field.NumberInputField label="Rank" placeholder="0" min={0} />
              )}
            </form.AppField>

            <form.SubmitButton>Attach Template</form.SubmitButton>
          </Stack>
        </form.Form>
      </form.AppForm>
    </Modal>
  );
}
