import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Text } from '@mantine/core';

import { TemplateDefaultsPage } from '@/features/card-builder';
import {
  templateSvgJsonQuery,
  useUpdateTemplateSvgJson,
} from '@/features/templates';

export const Route = createFileRoute(
  '/_authenticated/admin/templates/$id/defaults'
)({
  loader: async ({ context: { queryClient }, params: { id } }) => {
    await queryClient.ensureQueryData(
      templateSvgJsonQuery.getOptions(Number(id))
    );
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const updateSvgJson = useUpdateTemplateSvgJson();
  const { data: svgNode } = useSuspenseQuery(
    templateSvgJsonQuery.getOptions(Number(id))
  );

  const navigateToTemplate = () =>
    void navigate({ to: '/admin/templates/$id', params: { id } });

  if (!svgNode) {
    return (
      <Text c="dimmed" p="lg">
        No SVG available for this template.
      </Text>
    );
  }

  return (
    <TemplateDefaultsPage
      id={Number(id)}
      svgNode={svgNode}
      onSave={(params) =>
        updateSvgJson.mutate(params, { onSuccess: navigateToTemplate })
      }
      onBack={navigateToTemplate}
      isSaving={updateSvgJson.isPending}
    />
  );
}
