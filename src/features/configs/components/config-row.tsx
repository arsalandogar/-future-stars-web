import { useState } from 'react';
import { ActionIcon, Group, Table, Text, TextInput } from '@mantine/core';
import { revalidateLogic, useForm } from '@tanstack/react-form';
import { Check, Pencil, X } from 'lucide-react';
import * as v from 'valibot';

import { useUpdateConfig } from '../api/update-config';
import type { Config } from '../types';

const configSchema = v.object({
  value: v.pipe(
    v.string(),
    v.maxLength(255, 'Value must be at most 255 characters')
  ),
  description: v.pipe(
    v.string(),
    v.maxLength(500, 'Description must be at most 500 characters')
  ),
});

interface ConfigRowProps {
  config: Config;
}

export function ConfigRow({ config }: ConfigRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const updateConfig = useUpdateConfig();

  const form = useForm({
    defaultValues: {
      value: config.value,
      description: config.description,
    },
    validators: {
      onDynamic: configSchema,
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
          <form.Field name="value">
            {(field) => (
              <TextInput
                size="sm"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onKeyDown={handleKeyDown}
                error={field.state.meta.errors[0]?.message}
                autoFocus
              />
            )}
          </form.Field>
        ) : (
          <Text size="sm">{config.value}</Text>
        )}
      </Table.Td>
      <Table.Td>
        {isEditing ? (
          <form.Field name="description">
            {(field) => (
              <TextInput
                size="sm"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onKeyDown={handleKeyDown}
                error={field.state.meta.errors[0]?.message}
              />
            )}
          </form.Field>
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
