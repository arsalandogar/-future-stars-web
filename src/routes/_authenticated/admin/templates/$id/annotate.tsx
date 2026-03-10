import { createFileRoute } from '@tanstack/react-router';

import { templateSvgJsonQuery } from '@/features/templates';
import {
  loadSvgJson,
  TemplateAnnotatePage,
} from '@/features/template-annotator';

export const Route = createFileRoute(
  '/_authenticated/admin/templates/$id/annotate'
)({
  loader: async ({ context: { queryClient }, params: { id } }) => {
    const svgJson = await queryClient.fetchQuery(
      templateSvgJsonQuery.getOptions(Number(id))
    );
    loadSvgJson(svgJson);
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  return <TemplateAnnotatePage id={Number(id)} />;
}
