import { Stack, Switch } from '@mantine/core';
import { revalidateLogic } from '@tanstack/react-form';
import type { FeaturedItem } from '../types';

import { useCreateFeaturedItem } from '../api/create-featured-item';
import { useUpdateFeaturedItem } from '../api/update-featured-item';
import { useAppForm } from '@/lib/form';
import { featuredItemSchema } from '../utils/validation';
import { useTemplates } from '@/features/templates';

interface Props {
  item?: FeaturedItem;
  modalClose: () => void;
}

export function FeaturedItemForm({ item, modalClose }: Props) {
  const createFeaturedItem = useCreateFeaturedItem();
  const updateFeaturedItem = useUpdateFeaturedItem();
  const { data: templatesData } = useTemplates({ variables: {} });

  const defaultValues = {
    title: item?.title ?? '',
    description: item?.description ?? '',
    ctaText: item?.ctaText ?? '',
    displayOrder: item?.displayOrder ?? 0,
    templateId: item?.templateId ?? null,
    isActive: item?.isActive ?? true,
    image: null as File | null,
  };

  const form = useAppForm({
    defaultValues: defaultValues,
    validators: {
      onDynamic: featuredItemSchema,
    },
    validationLogic: revalidateLogic(),
    onSubmit: async ({ value }) => {
      const isEdit = !!item?.id;

      const data = {
        ...value,
        templateId: value.templateId ?? undefined,
      };

      if (isEdit) {
        await updateFeaturedItem.mutateAsync({ id: item.id, ...data });
      } else {
        await createFeaturedItem.mutateAsync(data);
      }

      form.reset();
      modalClose();
    },
  });

  return (
    <form.AppForm>
      <form.Form>
        <Stack gap="md">
          <form.AppField name="title">
            {(field) => <field.TextField label="Title" required />}
          </form.AppField>

          <form.AppField name="ctaText">
            {(field) => (
              <field.TextField
                label="CTA Text"
                placeholder="e.g., View Collection"
              />
            )}
          </form.AppField>

          <form.AppField name="templateId">
            {(field) => (
              <field.TemplateSelectField
                label="Template"
                placeholder="Search and select template"
                templates={templatesData?.data ?? []}
                searchable
                clearable
                nothingFoundMessage="No templates found"
              />
            )}
          </form.AppField>

          <form.AppField name="displayOrder">
            {(field) => (
              <field.NumberInputField label="Display Order" min={0} />
            )}
          </form.AppField>

          <form.AppField name="image">
            {(field) => (
              <field.ImageUploadCardField
                label="Image"
                existingImageUrl={item?.imageUrl}
                accept="image/png,image/jpeg,image/jpg"
                maxSizeInBytes={10 * 1024 * 1024} // 10MB size
              />
            )}
          </form.AppField>

          <form.AppField name="isActive">
            {(field) => (
              <Switch
                label="Active"
                checked={field.state.value}
                onChange={(e) => field.handleChange(e.currentTarget.checked)}
              />
            )}
          </form.AppField>

          <form.AppField name="description">
            {(field) => (
              <field.TextareaField
                label="Description"
                placeholder="Brief description of this featured item"
              />
            )}
          </form.AppField>

          <form.SubmitButton>
            {item ? 'Save Changes' : 'Create Featured Item'}
          </form.SubmitButton>
        </Stack>
      </form.Form>
    </form.AppForm>
  );
}
