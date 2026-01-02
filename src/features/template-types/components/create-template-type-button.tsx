import { Button, Modal, Stack } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { revalidateLogic } from '@tanstack/react-form';
import { Plus } from 'lucide-react';

import { useAppForm } from '@/lib/form';

import { useCreateTemplateType } from '../api/create-template-type';
import { createTemplateTypeSchema } from '../utils/validation';

const defaultValues = {
  name: '',
  extraPrice: 0,
};

export function CreateTemplateTypeButton() {
  const [opened, { open, close }] = useDisclosure(false);
  const createTemplateType = useCreateTemplateType();

  const form = useAppForm({
    defaultValues,
    validators: {
      onDynamic: createTemplateTypeSchema,
    },
    validationLogic: revalidateLogic(),
    onSubmit: ({ value }) => {
      createTemplateType.mutate(
        {
          name: value.name,
          extraPrice: value.extraPrice,
        },
        {
          onSuccess: () => {
            form.reset();
            close();
          },
        }
      );
    },
  });

  const handleClose = () => {
    form.reset();
    close();
  };

  return (
    <>
      <Button leftSection={<Plus size={16} />} onClick={open}>
        Add Template Type
      </Button>

      <Modal
        opened={opened}
        onClose={handleClose}
        title={<span className="font-bold">Create Template Type</span>}
      >
        <form.AppForm>
          <form.Form>
            <Stack gap="md">
              <form.AppField name="name">
                {(field) => (
                  <field.TextField
                    label="Name"
                    placeholder="Template type name"
                    required
                  />
                )}
              </form.AppField>

              <form.AppField name="extraPrice">
                {(field) => (
                  <field.NumberInputField
                    label="Extra Price (cents)"
                    placeholder="0"
                    min={0}
                    required
                  />
                )}
              </form.AppField>

              <form.SubmitButton fullWidth>
                Create Template Type
              </form.SubmitButton>
            </Stack>
          </form.Form>
        </form.AppForm>
      </Modal>
    </>
  );
}
