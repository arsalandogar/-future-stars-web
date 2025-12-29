import { Button, Modal, Stack, TextInput } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { revalidateLogic, useForm } from '@tanstack/react-form';
import { Plus } from 'lucide-react';

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

  const form = useForm({
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
        Add Config
      </Button>

      <Modal opened={opened} onClose={handleClose} title="Create Config">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void form.handleSubmit();
          }}
        >
          <Stack gap="md">
            <form.Field name="name">
              {(field) => (
                <TextInput
                  label="Name"
                  placeholder="CONFIG_NAME"
                  required
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  error={field.state.meta.errors[0]?.message}
                />
              )}
            </form.Field>

            <form.Field name="value">
              {(field) => (
                <TextInput
                  label="Value"
                  placeholder="Config value"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  error={field.state.meta.errors[0]?.message}
                />
              )}
            </form.Field>

            <form.Field name="description">
              {(field) => (
                <TextInput
                  label="Description"
                  placeholder="Describe what this config does"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  error={field.state.meta.errors[0]?.message}
                />
              )}
            </form.Field>

            <Button type="submit" loading={createConfig.isPending} fullWidth>
              Create Config
            </Button>
          </Stack>
        </form>
      </Modal>
    </>
  );
}
