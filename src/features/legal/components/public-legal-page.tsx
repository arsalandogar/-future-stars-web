import { Loader, Text, Title, TypographyStylesProvider } from '@mantine/core';

import { Head } from '@/components/seo/head';

import { usePublicLegalDocument } from '../api/get-public-legal-document';
import { LegalLayout } from './legal-layout';
import type { LegalDocumentType } from '../types';

interface PublicLegalPageProps {
  type: LegalDocumentType;
  title: string;
}

export function PublicLegalPage({ type, title }: PublicLegalPageProps) {
  const {
    data: documentResponse,
    isLoading,
    error,
  } = usePublicLegalDocument({
    variables: type,
  });
  const document = documentResponse?.data;

  return (
    <LegalLayout>
      <Head title={title} description={title} />

      {isLoading && (
        <div className="flex justify-center py-8">
          <Loader />
        </div>
      )}

      {!isLoading && (error || !document) && (
        <div className="py-8 text-center">
          <Title order={2} mb="md">
            {title}
          </Title>
          <Text c="dimmed">This document is not yet available.</Text>
        </div>
      )}

      {document && (
        <TypographyStylesProvider>
          <div dangerouslySetInnerHTML={{ __html: document.content }} />
        </TypographyStylesProvider>
      )}
    </LegalLayout>
  );
}
