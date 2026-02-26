import { useSuspenseQuery } from '@tanstack/react-query';
import { useDisclosure } from '@mantine/hooks';
import { useNavigate } from '@tanstack/react-router';

import { Head } from '@/components/seo/head';
import { usePageHeader } from '@/hooks/use-page-header';
import { openDeleteModal } from '@/utils/open-delete-modal';

import { useDeleteTag } from '../api/delete-tag';
import { tagQuery } from '../api/get-tag';
import { TagModal } from '../components/tag-modal';
import { TagView } from '../components/tag-view';

export interface TagViewPageProps {
  id: number;
}

export function TagViewPage({ id }: TagViewPageProps) {
  const navigate = useNavigate();
  const [opened, { open, close }] = useDisclosure(false);

  const { data: tagResponse } = useSuspenseQuery(tagQuery.getOptions(id));
  const tag = tagResponse.data;

  const deleteTag = useDeleteTag();

  usePageHeader({
    title: tag.name,
    dynamicBreadcrumb: tag.name,
  });

  const handleDelete = () => {
    openDeleteModal({
      entityType: 'Tag',
      itemName: tag.name,
      onConfirm: () => {
        deleteTag.mutate(id, {
          onSuccess: () => {
            void navigate({ to: '/admin/tags' });
          },
        });
      },
    });
  };

  return (
    <>
      <Head title={tag.name} description={`View tag: ${tag.name}`} />
      <TagModal tag={tag} opened={opened} onClose={close} />
      <TagView tag={tag} onEdit={open} onDelete={handleDelete} />
    </>
  );
}
