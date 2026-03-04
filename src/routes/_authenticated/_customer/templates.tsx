import { createFileRoute, stripSearchParams } from '@tanstack/react-router';
import * as v from 'valibot';

import {
  TemplatesBrowsePage,
  useTemplate,
  useTemplateTags,
  useTemplates,
} from '@/features/templates-browse';
import { DEFAULT_PAGE_LIMIT } from '@/lib/react-query';

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
  loaderDeps: ({ search: { tag, preview } }) => ({ tag, preview }),
  loader: async ({ context: { queryClient }, deps: { tag, preview } }) => {
    const tags = await queryClient.ensureQueryData(
      useTemplateTags.getOptions()
    );
    const selectedTag = tag ? tags.find((t) => t.name === tag) : undefined;

    void queryClient.prefetchInfiniteQuery({
      ...useTemplates.getOptions({
        tagIds: selectedTag ? [selectedTag.id] : undefined,
        limit: DEFAULT_PAGE_LIMIT,
      }),
      pages: 1,
    });

    if (preview != null) {
      void queryClient.prefetchQuery(useTemplate.getOptions(preview));
    }
  },
  component: TemplatesBrowsePage,
});
