import { Button, Modal, Stack, NumberInput } from '@mantine/core';
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
                  <NumberInput
                    label="Extra Price"
                    placeholder="0.00"
                    value={field.state.value}
                    onChange={(val) => {
                      const numVal =
                        typeof val === 'string'
                          ? parseFloat(val) || 0
                          : (val ?? 0);
                      field.handleChange(numVal);
                    }}
                    min={0}
                    decimalScale={2}
                    prefix="$"
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
