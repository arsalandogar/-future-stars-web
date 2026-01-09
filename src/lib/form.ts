import { createFormHook } from '@tanstack/react-form';

import {
  CheckboxField,
  ColorInputField,
  FloatingPasswordField,
  FloatingTextField,
  MultiSelectField,
  NumberInputField,
  Form,
  ImageUploadCardField,
  PasswordField,
  SelectField,
  SubmitButton,
  TextField,
  TextareaField,
} from '@/components/form/fields';

import { fieldContext, formContext } from './form-context';

export { useFieldContext, useFormContext } from './form-context';

export const { useAppForm, withForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    TextField,
    PasswordField,
    SelectField,
    MultiSelectField,
    TextareaField,
    FloatingTextField,
    FloatingPasswordField,
    ImageUploadCardField,
    NumberInputField,
    CheckboxField,
    ColorInputField,
  },
  formComponents: {
    Form,
    SubmitButton,
  },
});
