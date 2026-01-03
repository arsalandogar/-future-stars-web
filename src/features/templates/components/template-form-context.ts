import { revalidateLogic } from '@tanstack/react-form';

import { useFormContext, useAppForm } from '@/lib/form';

import { templateFormSchema } from '../utils/validation';
import type { TemplateFormValues, TemplateAttributeFormValues } from '../types';

const DEFAULT_VALUES: TemplateFormValues = {
  side: 'front',
  name: '',
  label: '',
  description: '',
  svgString: '',
  templateTypeId: null,
  backTemplateId: null,
  tagIds: [],
  attributes: [],
};

export function useTemplateForm(
  initialValues?: Partial<TemplateFormValues>,
  onSubmit?: (values: TemplateFormValues) => void
) {
  return useAppForm({
    defaultValues: {
      side: initialValues?.side ?? DEFAULT_VALUES.side,
      name: initialValues?.name ?? DEFAULT_VALUES.name,
      label: initialValues?.label ?? DEFAULT_VALUES.label,
      description: initialValues?.description ?? DEFAULT_VALUES.description,
      svgString: initialValues?.svgString ?? DEFAULT_VALUES.svgString,
      templateTypeId:
        initialValues?.templateTypeId ?? DEFAULT_VALUES.templateTypeId,
      backTemplateId:
        initialValues?.backTemplateId ?? DEFAULT_VALUES.backTemplateId,
      tagIds: initialValues?.tagIds ?? DEFAULT_VALUES.tagIds,
      attributes: initialValues?.attributes ?? DEFAULT_VALUES.attributes,
    },
    validators: {
      onDynamic: templateFormSchema,
    },
    validationLogic: revalidateLogic(),
    onSubmit: onSubmit
      ? ({ value }) => onSubmit(value as TemplateFormValues)
      : undefined,
  });
}

export type TemplateForm = ReturnType<typeof useTemplateForm>;

export function useTemplateFormContext() {
  const form = useFormContext();
  return form as unknown as TemplateForm;
}

export const DEFAULT_ATTRIBUTE: TemplateAttributeFormValues = {
  type: 'string',
  name: '',
  label: '',
  defaultValue: '',
  defaultColor: '',
};
