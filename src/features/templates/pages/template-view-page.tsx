import { useSuspenseQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';

import { Head } from '@/components/seo/head';
import { openDeleteModal } from '@/utils/open-delete-modal';
import { usePageHeader } from '@/hooks/use-page-header';

import { useDeleteTemplate } from '../api/delete-template';
import { templateQuery } from '../api/get-template';
import { TemplateView } from '../components/template-view';

export interface TemplateViewPageProps {
  id: number;
}

export function TemplateViewPage({ id }: TemplateViewPageProps) {
  const navigate = useNavigate();

  const { data: templateResponse } = useSuspenseQuery(
    templateQuery.getOptions(id)
  );
  const template = templateResponse.data;

  const deleteTemplate = useDeleteTemplate();

  usePageHeader({
    title: template.label,
    dynamicBreadcrumb: template.label,
  });

  const handleDelete = () => {
    openDeleteModal({
      entityType: 'Template',
      itemName: template.label,
      onConfirm: () => {
        deleteTemplate.mutate(id, {
          onSuccess: () => {
            void navigate({ to: '/admin/templates' });
          },
        });
      },
    });
  };

  return (
    <>
      <Head
        title={template.label}
        description={`View template: ${template.label}`}
      />
      <TemplateView template={template} onDelete={handleDelete} />
    </>
  );
}
