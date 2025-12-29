import { Button, Stack, Textarea, TextInput } from '@mantine/core';
import { revalidateLogic, useForm } from '@tanstack/react-form';
import type { Tag } from '../types';
import * as v from 'valibot';
import { notifications } from '@mantine/notifications';

import { useCreateTagWithInvalidation } from '../api/create-tag';
import { useUpdateTagWithInvalidation } from '../api/update-tag';

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
  const createTag = useCreateTagWithInvalidation();
  const updateTag = useUpdateTagWithInvalidation();

  const form = useForm({
    defaultValues: {
      name: tag?.name ?? '',
      label: tag?.label ?? '',
      description: tag?.description ?? '',
    },
    validators: {
      onDynamic: tagSchema,
    },
    validationLogic: revalidateLogic(),
    onSubmit: async ({ value }) => {
      try {
        const isEdit = !!tag?.id;
        if (isEdit) {
          // UPDATE
          await updateTag.mutateAsync({ id: tag.id, updatedTag: value });
        } else {
          //CREATE
          await createTag.mutateAsync(value);
        }
        notifications.show({
          color: 'green',
          title: 'Success',
          message: isEdit
            ? 'Tag successfully updated'
            : 'Tag successfully created',
        });
        modalClose();
      } catch (error) {
        console.log(error);
        notifications.show({
          color: 'red',
          title: 'Error',
          message: 'Something went wrong. Please try again.',
        });
      }
    },
  });

  return (
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
              required
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              error={field.state.meta.errors[0]?.message}
            />
          )}
        </form.Field>

        <form.Field name="label">
          {(field) => (
            <TextInput
              label="Label"
              required
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              error={field.state.meta.errors[0]?.message}
            />
          )}
        </form.Field>

        <form.Field name="description">
          {(field) => (
            <Textarea
              label="Description"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              error={field.state.meta.errors[0]?.message}
            />
          )}
        </form.Field>

        <Button
          type="submit"
          loading={createTag.isPending || updateTag.isPending}
        >
          {tag ? 'Update Tag' : 'Create Tag'}
        </Button>
      </Stack>
    </form>
  );
}
