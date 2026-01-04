import { createFormHookContexts } from '@tanstack/react-form';
import type { BaseIssue } from 'valibot';

export const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts();

/**
 * Extracts the error message from a field's validation errors array.
 * Assumes Valibot error structure with `message` property.
 */
export function getFieldError(errors: unknown[]): string | undefined {
  const firstError = errors[0] as BaseIssue<unknown> | undefined;
  return firstError?.message;
}
