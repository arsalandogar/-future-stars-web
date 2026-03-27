import { createFileRoute, stripSearchParams } from '@tanstack/react-router';
import * as v from 'valibot';

import { TeamColorsPage } from '@/features/team-colors';

const defaultValues = {
  colorType: 'colors' as const,
  search: '',
  leagueFilter: 'all' as const,
  teamPage: 1,
  teamLimit: 20,
  templateSide: 'all' as const,
  templateView: 'grid' as const,
  templateIndex: 0,
};

const teamColorsSearchSchema = v.object({
  colorType: v.optional(
    v.fallback(v.picklist(['colors', 'text']), 'colors'),
    'colors'
  ),
  search: v.optional(v.fallback(v.string(), ''), ''),
  leagueFilter: v.optional(
    v.fallback(
      v.union([
        v.picklist(['all', 'popular']),
        v.pipe(v.number(), v.integer()),
      ]),
      'all'
    ),
    'all'
  ),
  paletteId: v.optional(v.pipe(v.number(), v.integer())),
  teamPage: v.optional(
    v.fallback(v.pipe(v.number(), v.integer(), v.minValue(1)), 1),
    1
  ),
  teamLimit: v.optional(
    v.fallback(
      v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(100)),
      20
    ),
    20
  ),
  templateSide: v.optional(
    v.fallback(v.picklist(['all', 'front', 'back']), 'all'),
    'all'
  ),
  templateView: v.optional(
    v.fallback(v.picklist(['grid', 'single']), 'grid'),
    'grid'
  ),
  templateIndex: v.optional(
    v.fallback(v.pipe(v.number(), v.integer(), v.minValue(0)), 0),
    0
  ),
});

export const Route = createFileRoute('/_authenticated/admin/team-colors')({
  validateSearch: teamColorsSearchSchema,
  search: {
    middlewares: [stripSearchParams(defaultValues)],
  },
  component: TeamColorsPage,
});
