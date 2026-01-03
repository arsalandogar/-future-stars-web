import { Anchor, Breadcrumbs, Loader, Text, Title } from '@mantine/core';
import { modals } from '@mantine/modals';
import { Link, useNavigate } from '@tanstack/react-router';

import { Head } from '@/components/seo/head';

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

  const breadcrumbItems = [
    { title: 'Home', href: '/admin' },
    { title: 'Templates', href: '/admin/templates' },
    { title: template?.label ?? 'View', href: `/admin/templates/${id}` },
  ];

  const handleDelete = () => {
    modals.openConfirmModal({
      title: <Text fw={700}>Delete Template</Text>,
      centered: true,
      children: (
        <Text size="sm">
          Are you sure you want to delete template{' '}
          <strong>{template?.label}</strong>? This action cannot be undone.
        </Text>
      ),
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
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
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <Title order={2}>{template.label}</Title>
          <Breadcrumbs>
            {breadcrumbItems.map((item, index) => (
              <Anchor
                key={item.href}
                component={Link}
                to={item.href}
                c={index === breadcrumbItems.length - 1 ? undefined : 'dimmed'}
                size="sm"
              >
                {item.title}
              </Anchor>
            ))}
          </Breadcrumbs>
        </div>
        <TemplateView template={template} onDelete={handleDelete} />
      </div>
    </>
  );
}
