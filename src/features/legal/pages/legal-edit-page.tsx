import { Card, Text } from '@mantine/core';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';

import { Head } from '@/components/seo/head';
import { usePageHeader } from '@/hooks/use-page-header';

import { legalDocumentQuery } from '../api/get-legal-document';
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
  const basePath = `/admin/${type}`;

  const { data: documentResponse } = useSuspenseQuery(
    legalDocumentQuery.getOptions(id)
  );
  const document = documentResponse.data;

  const updateDocument = useUpdateLegalDocument();

  usePageHeader({
    title: `Edit ${config.title}`,
    dynamicBreadcrumb: document.version,
  });

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
    </>
  );
}
