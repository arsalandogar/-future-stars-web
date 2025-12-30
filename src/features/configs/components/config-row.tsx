import { useState } from 'react';
import { ActionIcon, Group, Table, Text } from '@mantine/core';
import { revalidateLogic } from '@tanstack/react-form';
import { Check, Pencil, X } from 'lucide-react';

import { useAppForm } from '@/lib/form';

import { useUpdateConfig } from '../api/update-config';
import type { Config } from '../types';
import { updateConfigSchema } from '../utils/validation';

interface ConfigRowProps {
  config: Config;
}

export function ConfigRow({ config }: ConfigRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const updateConfig = useUpdateConfig();

  const form = useAppForm({
    defaultValues: {
      value: config.value,
      description: config.description,
    },
    validators: {
      onDynamic: updateConfigSchema,
    },
    validationLogic: revalidateLogic(),
    onSubmit: ({ value }) => {
      updateConfig.mutate(
        {
          name: config.name,
          value: value.value,
          description: value.description,
        },
        {
          onSuccess: () => setIsEditing(false),
        }
      );
    },
  });

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      form.reset();
      setIsEditing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void form.handleSubmit();
  };

  const handleCancel = () => {
    form.reset();
    setIsEditing(false);
  };

  return (
    <>
      <Table.Td>
        <Text size="sm" fw={500}>
          {config.name}
        </Text>
      </Table.Td>
      <Table.Td>
        {isEditing ? (
          <form.AppField name="value">
            {(field) => (
              <field.TextField size="sm" onKeyDown={handleKeyDown} autoFocus />
            )}
          </form.AppField>
        ) : (
          <Text size="sm">{config.value}</Text>
        )}
      </Table.Td>
      <Table.Td>
        {isEditing ? (
          <form.AppField name="description">
            {(field) => <field.TextField size="sm" onKeyDown={handleKeyDown} />}
          </form.AppField>
        ) : (
          <Text size="sm" c="dimmed">
            {config.description}
          </Text>
        )}
      </Table.Td>
      <Table.Td>
        <Group gap="xs">
          {isEditing ? (
            <>
              <ActionIcon
                variant="subtle"
                color="green"
                onClick={handleSubmit}
                loading={updateConfig.isPending}
                disabled={updateConfig.isPending}
              >
                <Check size={16} />
              </ActionIcon>
              <ActionIcon
                variant="subtle"
                color="gray"
                onClick={handleCancel}
                disabled={updateConfig.isPending}
              >
                <X size={16} />
              </ActionIcon>
            </>
          ) : (
            <ActionIcon
              variant="subtle"
              color="gray"
              onClick={() => setIsEditing(true)}
            >
              <Pencil size={16} />
            </ActionIcon>
          )}
        </Group>
      </Table.Td>
    </>
  );
}
