import { useState } from 'react';
import { ActionIcon, Group, Table, Text } from '@mantine/core';
import { revalidateLogic } from '@tanstack/react-form';
import { Check, Pencil, Trash2, X } from 'lucide-react';
import { modals } from '@mantine/modals';

import { useAppForm } from '@/lib/form';

import { useUpdateTemplateType } from '../api/update-template-type';
import { useDeleteTemplateType } from '../api/delete-template-type';
import type { TemplateType } from '../types';
import { updateTemplateTypeSchema } from '../utils/validation';

interface TemplateTypeRowProps {
  templateType: TemplateType;
}

export function TemplateTypeRow({ templateType }: TemplateTypeRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const updateTemplateType = useUpdateTemplateType();
  const deleteTemplateType = useDeleteTemplateType();

  const form = useAppForm({
    defaultValues: {
      name: templateType.name,
      extraPrice: templateType.extraPrice,
    },
    validators: {
      onDynamic: updateTemplateTypeSchema,
    },
    validationLogic: revalidateLogic(),
    onSubmit: ({ value }) => {
      updateTemplateType.mutate(
        {
          id: templateType.id,
          name: value.name,
          extraPrice: value.extraPrice,
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

  const handleDelete = () => {
    modals.openConfirmModal({
      title: <Text fw={700}>Delete Template Type</Text>,
      centered: true,
      children: (
        <Text size="sm">
          Are you sure you want to delete <b>{templateType.name}</b>? This
          action cannot be undone.
        </Text>
      ),
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: () => {
        deleteTemplateType.mutate(templateType.id);
      },
    });
  };

  return (
    <>
      <Table.Td>
        <Text size="sm" fw={500}>
          {templateType.id}
        </Text>
      </Table.Td>
      <Table.Td>
        {isEditing ? (
          <form.AppField name="name">
            {(field) => (
              <field.TextField size="sm" onKeyDown={handleKeyDown} autoFocus />
            )}
          </form.AppField>
        ) : (
          <Text size="sm">{templateType.name}</Text>
        )}
      </Table.Td>
      <Table.Td>
        {isEditing ? (
          <form.AppField name="extraPrice">
            {(field) => (
              <field.NumberInputField
                size="sm"
                onKeyDown={handleKeyDown}
                min={0}
              />
            )}
          </form.AppField>
        ) : (
          <Text size="sm">{templateType.extraPrice}</Text>
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
                loading={updateTemplateType.isPending}
                disabled={updateTemplateType.isPending}
              >
                <Check size={16} />
              </ActionIcon>
              <ActionIcon
                variant="subtle"
                color="gray"
                onClick={handleCancel}
                disabled={updateTemplateType.isPending}
              >
                <X size={16} />
              </ActionIcon>
            </>
          ) : (
            <>
              <ActionIcon
                variant="subtle"
                color="gray"
                onClick={() => setIsEditing(true)}
              >
                <Pencil size={16} />
              </ActionIcon>
              <ActionIcon
                variant="subtle"
                color="red"
                onClick={handleDelete}
                loading={deleteTemplateType.isPending}
              >
                <Trash2 size={16} />
              </ActionIcon>
            </>
          )}
        </Group>
      </Table.Td>
    </>
  );
}
