import { Loader, Text } from '@mantine/core';
import { useNavigate } from '@tanstack/react-router';

import { Head } from '@/components/seo/head';
import { openDeleteModal } from '@/utils/open-delete-modal';
import { usePageHeader } from '@/hooks/use-page-header';

import { useDeleteTemplate } from '../api/delete-template';
import { useTemplate } from '../api/get-template';
import { TemplateView } from '../components/template-view';

export interface TemplateViewPageProps {
  id: number;
}

export function TemplateViewPage({ id }: TemplateViewPageProps) {
  const navigate = useNavigate();

  const { data: templateResponse, isLoading } = useTemplate({
    variables: id,
  });
  const template = templateResponse?.data;

  const deleteTemplate = useDeleteTemplate();

  usePageHeader({
    title: template?.label ?? 'Template',
    dynamicBreadcrumb: template?.label,
  });

  const handleDelete = () => {
    openDeleteModal({
      entityType: 'Template',
      itemName: template?.label ?? 'this template',
      onConfirm: () => {
        deleteTemplate.mutate(id, {
          onSuccess: () => {
            void navigate({ to: '/admin/templates' });
          },
        });
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader />
      </div>
    );
  }

  if (!template) {
    return (
      <div className="flex justify-center py-8">
        <Text c="dimmed">Template not found</Text>
      </div>
    );
  }

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
