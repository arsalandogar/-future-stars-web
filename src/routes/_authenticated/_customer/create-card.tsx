import { createFileRoute } from '@tanstack/react-router';
import * as v from 'valibot';

import { CreateCardPage } from '@/features/card-builder';

const searchSchema = v.object({
  templateId: v.optional(v.pipe(v.number(), v.integer())),
});

export const Route = createFileRoute('/_authenticated/_customer/create-card')({
  component: CreateCardPage,
  validateSearch: searchSchema,
});
