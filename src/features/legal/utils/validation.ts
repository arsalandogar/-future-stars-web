import * as v from 'valibot';

export const legalDocumentVersionSchema = v.pipe(
  v.string(),
  v.nonEmpty('Version is required'),
  v.maxLength(20, 'Version must be at most 20 characters')
);

export const legalDocumentContentSchema = v.pipe(
  v.string(),
  v.nonEmpty('Content is required')
);

export const legalDocumentSchema = v.object({
  version: legalDocumentVersionSchema,
  content: legalDocumentContentSchema,
});
