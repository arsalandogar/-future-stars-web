import { Stack } from '@mantine/core';
import { revalidateLogic } from '@tanstack/react-form';
import type { Tag } from '../types';
import * as v from 'valibot';

import { useCreateTag } from '../api/create-tag';
import { useUpdateTag } from '../api/update-tag';
import { useAppForm } from '@/lib/form';

const tagSchema = v.object({
  name: v.pipe(v.string(), v.nonEmpty('Name is required')),
  label: v.pipe(
    v.string(),
    v.nonEmpty('Label is required'),
    v.maxLength(64, 'Label must be at most 64 characters')
  ),
  description: v.pipe(v.string(), v.maxLength(255, 'Max 255 characters')),
});

type Props = {
  tag?: Tag;
  modalClose: () => void;
};

export function TagForm({ tag, modalClose }: Props) {
  const createTag = useCreateTag();
  const updateTag = useUpdateTag();

  const defaultValues = {
    name: tag?.name ?? '',
    label: tag?.label ?? '',
    description: tag?.description ?? '',
  };

  const form = useAppForm({
    defaultValues: defaultValues,
    validators: {
      onDynamic: tagSchema,
    },
    validationLogic: revalidateLogic(),
    onSubmit: async ({ value }) => {
      const isEdit = !!tag?.id;

      if (isEdit) {
        await updateTag.mutateAsync({ id: tag.id, updatedTag: value });
      } else {
        await createTag.mutateAsync(value);
      }

      form.reset();
      modalClose();
    },
  });

  return (
    <form.AppForm>
      <form.Form>
        <Stack gap="md">
          <form.AppField name="name">
            {(field) => <field.TextField label="Name" required size="md" />}
          </form.AppField>

          <form.AppField name="label">
            {(field) => <field.TextField label="Label" required size="md" />}
          </form.AppField>

          <form.AppField name="description">
            {(field) => (
              <field.TextareaField
                label="Description"
                placeholder="Brief description of what this tag represents"
              />
            )}
          </form.AppField>

          <form.SubmitButton size="md">
            {tag ? 'Update Tag' : 'Create Tag'}
          </form.SubmitButton>
        </Stack>
      </form.Form>
    </form.AppForm>
  );
}
