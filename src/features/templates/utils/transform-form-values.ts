import type { CreateTemplateParams, TemplateFormValues } from '../types';

/**
 * Transforms form values to API params for create/update operations.
 * Handles the logic for back template selection.
 */
export function transformFormValuesToParams(
  values: TemplateFormValues
): Omit<CreateTemplateParams, 'id'> {
  // For front templates, if backTemplateMode is 'default', send null for backTemplateId
  const backTemplateId =
    values.side === 'front' && values.backTemplateMode === 'default'
      ? null
      : (values.backTemplateId ?? undefined);

  return {
    side: values.side,
    name: values.name,
    label: values.label,
    description: values.description || undefined,
    templateTypeId: values.templateTypeId!,
    backTemplateId,
    isDefaultBack: values.side === 'back' ? values.isDefaultBack : undefined,
    isPublished: values.isPublished,
    tagIds: values.tagIds,
  };
}
