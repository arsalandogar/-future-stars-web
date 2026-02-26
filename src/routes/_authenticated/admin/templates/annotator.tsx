import { createFileRoute, lazyRouteComponent } from '@tanstack/react-router';

export const Route = createFileRoute(
  '/_authenticated/admin/templates/annotator'
)({
  component: lazyRouteComponent(
    () => import('@/features/template-annotator'),
    'AnnotatorPage'
  ),
});
