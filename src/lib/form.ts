import { createFormHook } from '@tanstack/react-form';

import {
  CheckboxField,
  ColorInputField,
  FloatingPasswordField,
  FloatingTextField,
  Form,
  ImageUploadCardField,
  NumberInputField,
  PasswordField,
  PhoneField,
  RadioGroupField,
  SelectField,
  SubmitButton,
  TemplateSelectField,
  TextareaField,
  TextField,
} from '@/components/form/fields';

import { fieldContext, formContext } from './form-context';

export { useFieldContext, useFormContext } from './form-context';

export const { useAppForm, withForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    CheckboxField,
    ColorInputField,
    FloatingPasswordField,
    FloatingTextField,
    ImageUploadCardField,
    NumberInputField,
    PasswordField,
    PhoneField,
    RadioGroupField,
    SelectField,
    TemplateSelectField,
    TextareaField,
    TextField,
  },
  formComponents: {
    Form,
    SubmitButton,
  },
});
