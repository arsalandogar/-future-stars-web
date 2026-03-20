import * as v from 'valibot';

const colorPairSchema = v.object({
  bg: v.pipe(v.string(), v.minLength(1, 'Background color is required')),
  fg: v.pipe(v.string(), v.minLength(1, 'Foreground color is required')),
  rank: v.pipe(v.number(), v.minValue(0, 'Rank must be 0 or greater')),
});

export const colorPaletteSchema = v.object({
  name: v.pipe(
    v.string(),
    v.minLength(1, 'Name is required'),
    v.maxLength(255, 'Name must be 255 characters or less')
  ),
  colorPairs: v.pipe(
    v.array(colorPairSchema),
    v.minLength(1, 'At least one color pair is required')
  ),
  isActive: v.boolean(),
});

export type ColorPaletteFormValues = v.InferInput<typeof colorPaletteSchema>;

export const attachTemplateSchema = v.object({
  templateId: v.pipe(
    v.nullable(v.number()),
    v.check((val) => val !== null, 'Template is required')
  ),
  rank: v.pipe(v.number(), v.minValue(0, 'Rank must be 0 or greater')),
});

export type AttachTemplateFormValues = v.InferInput<
  typeof attachTemplateSchema
>;
