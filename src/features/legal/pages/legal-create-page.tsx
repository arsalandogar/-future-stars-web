import { Card } from '@mantine/core';
import { useNavigate } from '@tanstack/react-router';

import { Head } from '@/components/seo/head';
import { usePageHeader } from '@/hooks/use-page-header';

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
  const basePath = `/admin/${type}`;

  usePageHeader({
    title: `Create ${config.title}`,
  });

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
      <Card withBorder radius="md" p="lg">
        <LegalDocumentForm onSubmit={handleSubmit} submitLabel="Create Draft" />
      </Card>
    </>
  );
}
