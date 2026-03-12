import type { QueryClient } from '@tanstack/react-query';
import * as v from 'valibot';

import { useTemplateSvgJson } from '@/features/templates';
import {
  useTemplate,
  useTemplateTags,
  useTemplates,
} from '@/features/templates-browse';
import { DEFAULT_PAGE_LIMIT } from '@/lib/react-query';

export const cardBuilderSearchSchema = v.object({
  templateId: v.optional(v.pipe(v.number(), v.integer())),
});

interface PrefetchTemplateOptions {
  templateId: number;
  backTemplateId?: number | null;
}

export function prefetchCardBuilderCatalog(queryClient: QueryClient) {
  void queryClient.prefetchQuery(useTemplateTags.getOptions());
  void queryClient.prefetchInfiniteQuery({
    ...useTemplates.getOptions({ limit: DEFAULT_PAGE_LIMIT }),
    pages: 1,
  });
}

export function prefetchCardBuilderTemplates(
  queryClient: QueryClient,
  { templateId, backTemplateId = null }: PrefetchTemplateOptions
) {
  void queryClient.prefetchQuery(useTemplate.getOptions(templateId));
  void queryClient.prefetchQuery(useTemplateSvgJson.getOptions(templateId));

  if (backTemplateId != null) {
    void queryClient.prefetchQuery(
      useTemplateSvgJson.getOptions(backTemplateId)
    );
  }
}
