import { Head } from '@/components/seo/head';

import { TagsList } from '../components/tags-list';

export function TagsListPage() {
  return (
    <>
      <Head title="Tags" description="Manage Tags" />
      <TagsList />
    </>
  );
}
