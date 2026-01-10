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
  useDefaultBack: false,
  isDefaultBack: false,
  isPublished: true,
  tagIds: [],
  attributes: [],
};

export function useTemplateForm(
  initialValues?: Partial<TemplateFormValues>,
  onSubmit?: (values: TemplateFormValues) => void | Promise<void>
) {
  return useAppForm({
    defaultValues: { ...DEFAULT_VALUES, ...initialValues },
    validators: {
      onDynamic: templateFormSchema,
    },
    validationLogic: revalidateLogic(),
    onSubmit: onSubmit
      ? async ({ value }) => {
          await onSubmit(value as TemplateFormValues);
        }
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
