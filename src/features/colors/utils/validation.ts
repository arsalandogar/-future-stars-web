import * as v from 'valibot';

export const colorLeagueSchema = v.object({
  name: v.pipe(v.string(), v.minLength(1, 'Name is required')),
  label: v.pipe(v.string(), v.minLength(1, 'Label is required')),
  rank: v.pipe(v.number(), v.minValue(0, 'Rank must be 0 or greater')),
  isActive: v.boolean(),
});

export type ColorLeagueFormValues = v.InferInput<typeof colorLeagueSchema>;

export const colorPresetSchema = v.object({
  colorLeagueId: v.pipe(
    v.nullable(v.number()),
    v.check((val) => val !== null, 'Color League is required')
  ),
  name: v.pipe(
    v.string(),
    v.minLength(1, 'Name is required'),
    v.maxLength(255, 'Name must be 255 characters or less')
  ),
  abbreviation: v.pipe(
    v.string(),
    v.minLength(1, 'Abbreviation is required'),
    v.maxLength(50, 'Abbreviation must be 50 characters or less')
  ),
  colors: v.pipe(
    v.array(v.string()),
    v.minLength(1, 'At least one color is required')
  ),
  rank: v.pipe(v.number(), v.minValue(0, 'Rank must be 0 or greater')),
  isFeatured: v.boolean(),
  isActive: v.boolean(),
});

export type ColorPresetFormValues = v.InferInput<typeof colorPresetSchema>;
