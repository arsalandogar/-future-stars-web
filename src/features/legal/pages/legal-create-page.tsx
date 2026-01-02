import { Anchor, Breadcrumbs, Card, Title } from '@mantine/core';
import { Link, useNavigate } from '@tanstack/react-router';

import { Head } from '@/components/seo/head';

import { useCreateLegalDocument } from '../api/create-legal-document';
import { LegalDocumentForm } from '../components/legal-document-form';
import { getLegalDocumentConfig, type LegalDocumentType } from '../types';

export interface LegalCreatePageProps {
  type: LegalDocumentType;
}

export function LegalCreatePage({ type }: LegalCreatePageProps) {
  const navigate = useNavigate();
  const createDocument = useCreateLegalDocument();

  const config = getLegalDocumentConfig(type);
  const basePath = `/admin/legal/${type}`;

  const breadcrumbItems = [
    { title: 'Home', href: '/admin' },
    { title: config.title, href: basePath },
    { title: 'Create', href: `${basePath}/create` },
  ];

  const handleSubmit = (values: { version: string; content: string }) => {
    createDocument.mutate(
      {
        type,
        version: values.version,
        content: values.content,
      },
      {
        onSuccess: () => {
          void navigate({ to: basePath });
        },
      }
    );
  };

  return (
    <>
      <Head
        title={`Create ${config.title}`}
        description={`Create a new ${config.title.toLowerCase()} document`}
      />
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <Title order={2}>Create {config.title}</Title>
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
            onSubmit={handleSubmit}
            submitLabel="Create Draft"
          />
        </Card>
      </div>
    </>
  );
}
