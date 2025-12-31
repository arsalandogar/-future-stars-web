import { createFormHook } from '@tanstack/react-form';

import {
  FloatingPasswordField,
  FloatingTextField,
  Form,
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
    TextareaField,
    FloatingTextField,
    FloatingPasswordField,
  },
  formComponents: {
    Form,
    SubmitButton,
  },
});
