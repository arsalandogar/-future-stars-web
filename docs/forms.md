# Forms

Uses **TanStack Form** with **Valibot** for schema validation and form composition via `createFormHook`:

- Use `useAppForm` from `@/lib/form` instead of `useForm` for pre-bound field components
- Use `form.AppField` with field components like `<field.TextField label="Name" />`
- Available field components: `TextField`, `PasswordField`, `SelectField`, `TextareaField`, `FloatingTextField`, `FloatingPasswordField`, `NumberInputField`, `ImageUploadCardField`, `CheckboxField`, `ColorInputField`, `TemplateSelectField`, `PhoneField`, `RadioGroupField`
- `SelectField` supports `multi` prop for multi-select and `valueAs` prop (`'string'` | `'number'`) for value type coercion
- Available form components: `Form`, `SubmitButton` (wrap with `<form.AppForm>` to use)

```typescript
import { useAppForm } from '@/lib/form';

const form = useAppForm({
  defaultValues: { name: '' },
  validators: { onDynamic: schema },
  validationLogic: revalidateLogic(),
  onSubmit: ({ value }) => { /* ... */ },
});

// In JSX:
<form.AppForm>
  <form.Form>
    <form.AppField name="name">
      {(field) => <field.TextField label="Name" />}
    </form.AppField>
    <form.SubmitButton>Submit</form.SubmitButton>
  </form.Form>
</form.AppForm>
```

To add new field components, create them in `src/components/form/fields/` using `useFieldContext` from `@/lib/form-context`, then register in `src/lib/form.ts`
