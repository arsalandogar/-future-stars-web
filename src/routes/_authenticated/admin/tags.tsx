import { Head } from '@/components/seo/head';
import TagsManager from '@/features/tag/component/TagsManager';

import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/admin/tags')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <Head title="Tags" description="Manage Tags" />
      <TagsManager />
    </>
  );
}
