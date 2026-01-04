import { Button, Modal, Stack } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { revalidateLogic } from '@tanstack/react-form';
import { Plus } from 'lucide-react';

import { useAppForm } from '@/lib/form';

import { useCreateConfig } from '../api/update-config';
import { createConfigSchema } from '../utils/validation';

const defaultValues = {
  name: '',
  value: '',
  description: '',
};

export function CreateConfigButton() {
  const [opened, { open, close }] = useDisclosure(false);
  const createConfig = useCreateConfig();

  const form = useAppForm({
    defaultValues,
    validators: {
      onDynamic: createConfigSchema,
    },
    validationLogic: revalidateLogic(),
    onSubmit: ({ value }) => {
      createConfig.mutate(
        {
          name: value.name,
          value: value.value || undefined,
          description: value.description || undefined,
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
        Create Config
      </Button>

      <Modal opened={opened} onClose={handleClose} title="Create Config">
        <form.AppForm>
          <form.Form>
            <Stack gap="md">
              <form.AppField name="name">
                {(field) => (
                  <field.TextField
                    label="Name"
                    placeholder="CONFIG_NAME"
                    required
                  />
                )}
              </form.AppField>

              <form.AppField name="value">
                {(field) => (
                  <field.TextField label="Value" placeholder="Config value" />
                )}
              </form.AppField>

              <form.AppField name="description">
                {(field) => (
                  <field.TextField
                    label="Description"
                    placeholder="Describe what this config does"
                  />
                )}
              </form.AppField>

              <form.SubmitButton fullWidth>Create Config</form.SubmitButton>
            </Stack>
          </form.Form>
        </form.AppForm>
      </Modal>
    </>
  );
}
