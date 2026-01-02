import * as v from 'valibot';

export const colorLeagueSchema = v.object({
  name: v.pipe(v.string(), v.minLength(1, 'Name is required')),
  label: v.pipe(v.string(), v.minLength(1, 'Label is required')),
  rank: v.pipe(v.number(), v.minValue(0, 'Rank must be 0 or greater')),
  isActive: v.boolean(),
});

export type ColorLeagueFormValues = v.InferInput<typeof colorLeagueSchema>;
