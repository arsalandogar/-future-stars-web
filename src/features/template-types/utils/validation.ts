import * as v from 'valibot';

export const templateTypeNameSchema = v.pipe(
  v.string(),
  v.nonEmpty('Name is required'),
  v.maxLength(255, 'Name must be at most 255 characters')
);

export const templateTypeExtraPriceSchema = v.pipe(
  v.number(),
  v.minValue(0, 'Extra price must be 0 or greater')
);

export const createTemplateTypeSchema = v.object({
  name: templateTypeNameSchema,
  extraPrice: templateTypeExtraPriceSchema,
});

export const updateTemplateTypeSchema = v.object({
  name: templateTypeNameSchema,
  extraPrice: templateTypeExtraPriceSchema,
});
