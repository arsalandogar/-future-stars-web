import * as v from 'valibot';

export const configNameSchema = v.pipe(
  v.string(),
  v.nonEmpty('Name is required'),
  v.maxLength(255, 'Name must be at most 255 characters')
);

export const configValueSchema = v.pipe(
  v.string(),
  v.maxLength(255, 'Value must be at most 255 characters')
);

export const configDescriptionSchema = v.pipe(
  v.string(),
  v.maxLength(500, 'Description must be at most 500 characters')
);

export const createConfigSchema = v.object({
  name: configNameSchema,
  value: configValueSchema,
  description: configDescriptionSchema,
});

export const updateConfigSchema = v.object({
  value: configValueSchema,
  description: configDescriptionSchema,
});
