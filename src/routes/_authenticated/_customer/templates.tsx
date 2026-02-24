import { createFileRoute, stripSearchParams } from '@tanstack/react-router';
import * as v from 'valibot';

import {
  TemplatesBrowsePage,
  useBrowseTemplates,
} from '@/features/templates-browse';

const defaultValues = {
  tag: undefined as string | undefined,
  preview: undefined as number | undefined,
};

const searchSchema = v.object({
  tag: v.optional(v.string()),
  preview: v.optional(v.number()),
});

export const Route = createFileRoute('/_authenticated/_customer/templates')({
  validateSearch: searchSchema,
  search: { middlewares: [stripSearchParams(defaultValues)] },
  loader: ({ context: { queryClient } }) => {
    void queryClient.prefetchQuery(useBrowseTemplates.getOptions());
  },
  component: TemplatesBrowsePage,
});
