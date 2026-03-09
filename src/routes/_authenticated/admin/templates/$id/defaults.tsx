import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';

import { TemplateDefaultsPage } from '@/features/card-builder';
import {
  templateQuery,
  useTemplateSvgJson,
  useUpdateTemplateSvgJson,
} from '@/features/templates';

export const Route = createFileRoute(
  '/_authenticated/admin/templates/$id/defaults'
)({
  loader: async ({ context: { queryClient }, params: { id } }) => {
    const [template] = await Promise.all([
      queryClient.ensureQueryData(templateQuery.getOptions(Number(id))),
      queryClient.ensureQueryData(useTemplateSvgJson.getOptions(Number(id))),
    ]);
    return { templateName: template.data.label };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  const { templateName } = Route.useLoaderData();
  const navigate = useNavigate();
  const updateSvgJson = useUpdateTemplateSvgJson();
  const { data: svgNode } = useSuspenseQuery(
    useTemplateSvgJson.getOptions(Number(id))
  );

  const navigateToTemplate = () =>
    void navigate({ to: '/admin/templates/$id', params: { id } });

  return (
    <TemplateDefaultsPage
      id={Number(id)}
      svgNode={svgNode}
      templateName={templateName}
      onSave={(params) =>
        updateSvgJson.mutate(params, { onSuccess: navigateToTemplate })
      }
      onBack={navigateToTemplate}
      isSaving={updateSvgJson.isPending}
    />
  );
}
