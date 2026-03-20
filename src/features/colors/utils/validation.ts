import * as v from 'valibot';

export const leagueSchema = v.object({
  name: v.pipe(v.string(), v.minLength(1, 'Name is required')),
  label: v.pipe(v.string(), v.minLength(1, 'Label is required')),
  rank: v.pipe(v.number(), v.minValue(0, 'Rank must be 0 or greater')),
  isActive: v.boolean(),
});

export type LeagueFormValues = v.InferInput<typeof leagueSchema>;

export const colorTeamSchema = v.object({
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
  colorPaletteId: v.pipe(
    v.nullable(v.number()),
    v.check((val) => val !== null, 'Color Palette is required')
  ),
  leagueId: v.nullable(v.number()),
  rank: v.pipe(v.number(), v.minValue(0, 'Rank must be 0 or greater')),
  isFeatured: v.boolean(),
  isActive: v.boolean(),
});

export type ColorTeamFormValues = v.InferInput<typeof colorTeamSchema>;
