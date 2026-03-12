import { createFileRoute, Outlet } from '@tanstack/react-router';

import {
  cardBuilderSearchSchema,
  prefetchCardBuilderCatalog,
  prefetchCardBuilderTemplates,
} from '@/features/card-builder';

export const Route = createFileRoute('/_authenticated/_customer/_card-builder')(
  {
    validateSearch: cardBuilderSearchSchema,
    loaderDeps: ({ search: { templateId } }) => ({ templateId }),
    loader: ({ context: { queryClient }, deps: { templateId } }) => {
      prefetchCardBuilderCatalog(queryClient);

      if (templateId != null) {
        prefetchCardBuilderTemplates(queryClient, { templateId });
      }
    },
    component: CardBuilderLayout,
  }
);

function CardBuilderLayout() {
  return <Outlet />;
}
