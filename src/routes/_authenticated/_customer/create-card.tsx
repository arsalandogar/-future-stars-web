import { createFileRoute } from '@tanstack/react-router';
import * as v from 'valibot';

import { useTemplateSvgJson } from '@/features/templates';
import { CreateCardPage } from '@/features/card-builder';
import {
  useTemplate,
  useTemplateTags,
  useTemplates,
} from '@/features/templates-browse';
import { DEFAULT_PAGE_LIMIT } from '@/lib/react-query';

const searchSchema = v.object({
  templateId: v.optional(v.pipe(v.number(), v.integer())),
});

export const Route = createFileRoute('/_authenticated/_customer/create-card')({
  component: CreateCardPage,
  validateSearch: searchSchema,
  loaderDeps: ({ search: { templateId } }) => ({ templateId }),
  loader: ({ context: { queryClient }, deps: { templateId } }) => {
    // Prefetch templates tab data
    void queryClient.prefetchQuery(useTemplateTags.getOptions());
    void queryClient.prefetchInfiniteQuery({
      ...useTemplates.getOptions({ limit: DEFAULT_PAGE_LIMIT }),
      pages: 1,
    });

    // Prefetch selected template data
    if (templateId != null) {
      void queryClient.prefetchQuery(useTemplate.getOptions(templateId));
      void queryClient.prefetchQuery(useTemplateSvgJson.getOptions(templateId));
    }
  },
});
