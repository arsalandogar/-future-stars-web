import { Anchor, Breadcrumbs, Card, Loader, Text, Title } from '@mantine/core';
import { Link, useNavigate } from '@tanstack/react-router';

import { Head } from '@/components/seo/head';

import { useLegalDocument } from '../api/get-legal-document';
import { useUpdateLegalDocument } from '../api/update-legal-document';
import { LegalDocumentForm } from '../components/legal-document-form';
import { getLegalDocumentConfig, type LegalDocumentType } from '../types';

export interface LegalEditPageProps {
  type: LegalDocumentType;
  id: number;
}

export function LegalEditPage({ type, id }: LegalEditPageProps) {
  const navigate = useNavigate();

  const config = getLegalDocumentConfig(type);
  const basePath = `/admin/legal/${type}`;

  const { data: documentResponse, isLoading } = useLegalDocument({
    variables: id,
  });
  const document = documentResponse?.data;

  const updateDocument = useUpdateLegalDocument();

  const breadcrumbItems = [
    { title: 'Home', href: '/admin' },
    { title: config.title, href: basePath },
    { title: document?.version ?? 'Edit', href: `${basePath}/${id}` },
    { title: 'Edit', href: `${basePath}/${id}/edit` },
  ];

  const handleSubmit = (values: { version: string; content: string }) => {
    updateDocument.mutate(
      {
        id,
        version: values.version,
        content: values.content,
      },
      {
        onSuccess: () => {
          void navigate({ to: `${basePath}/${id}` });
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader />
      </div>
    );
  }

  if (!document) {
    return (
      <div className="flex justify-center py-8">
        <Text c="dimmed">Document not found</Text>
      </div>
    );
  }

  if (!document.isDraft) {
    return (
      <div className="flex justify-center py-8">
        <Text c="dimmed">Only draft documents can be edited</Text>
      </div>
    );
  }

  return (
    <>
      <Head
        title={`Edit ${config.title} v${document.version}`}
        description={`Edit ${config.title.toLowerCase()} document`}
      />
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <Title order={2}>Edit {config.title}</Title>
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
        <Card withBorder radius="md" p="lg">
          <LegalDocumentForm
            initialValues={{
              version: document.version,
              content: document.content,
            }}
            onSubmit={handleSubmit}
            submitLabel="Save Changes"
          />
        </Card>
      </div>
    </>
  );
}
