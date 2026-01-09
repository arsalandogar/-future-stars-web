import type { CreateTemplateParams, TemplateFormValues } from '../types';

/**
 * Transforms form values to API params for create/update operations.
 * Handles the logic for back template selection and attribute mapping.
 */
export function transformFormValuesToParams(
  values: TemplateFormValues
): Omit<CreateTemplateParams, 'id'> {
  // For front templates, if useDefaultBack is true, send null for backTemplateId
  const backTemplateId =
    values.side === 'front' && values.useDefaultBack
      ? null
      : (values.backTemplateId ?? undefined);

  return {
    side: values.side,
    name: values.name,
    label: values.label,
    description: values.description || undefined,
    svgString: values.svgString || undefined,
    templateTypeId: values.templateTypeId!,
    backTemplateId,
    isDefaultBack: values.side === 'back' ? values.isDefaultBack : undefined,
    tagIds: values.tagIds.map((id) => Number(id)),
    attributes: values.attributes.map((attr) => ({
      type: attr.type,
      name: attr.name,
      label: attr.label,
      defaultValue: attr.defaultValue || undefined,
      defaultColor: attr.defaultColor || undefined,
    })),
  };
}
