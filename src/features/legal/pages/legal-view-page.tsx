import { Loader, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useNavigate } from '@tanstack/react-router';

import { Head } from '@/components/seo/head';
import { openDeleteModal } from '@/utils/open-delete-modal';
import { usePageHeader } from '@/hooks/use-page-header';

import { useDeleteLegalDocument } from '../api/delete-legal-document';
import { useLegalDocument } from '../api/get-legal-document';
import { usePublishLegalDocument } from '../api/publish-legal-document';
import { LegalDocumentView } from '../components/legal-document-view';
import { PublishModal } from '../components/publish-modal';
import { getLegalDocumentConfig, type LegalDocumentType } from '../types';

export interface LegalViewPageProps {
  type: LegalDocumentType;
  id: number;
}

export function LegalViewPage({ type, id }: LegalViewPageProps) {
  const navigate = useNavigate();

  const config = getLegalDocumentConfig(type);
  const basePath = `/admin/${type}`;

  const { data: documentResponse, isLoading } = useLegalDocument({
    variables: id,
  });
  const document = documentResponse?.data;

  const publishDocument = usePublishLegalDocument();
  const deleteDocument = useDeleteLegalDocument();

  const [
    publishModalOpened,
    { open: openPublishModal, close: closePublishModal },
  ] = useDisclosure(false);

  usePageHeader({
    title: config.title,
    dynamicBreadcrumb: document?.version,
  });

  const handlePublishConfirm = (requiresAcceptance: boolean) => {
    publishDocument.mutate(
      { id, requiresAcceptance },
      {
        onSuccess: () => {
          closePublishModal();
        },
      }
    );
  };

  const handleDelete = () => {
    openDeleteModal({
      entityType: 'Document',
      itemName: `version ${document?.version ?? ''}`,
      onConfirm: () => {
        deleteDocument.mutate(id, {
          onSuccess: () => {
            void navigate({ to: basePath });
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

  if (!document) {
    return (
      <div className="flex justify-center py-8">
        <Text c="dimmed">Document not found</Text>
      </div>
    );
  }

  return (
    <>
      <Head
        title={`${config.title} v${document.version}`}
        description={`View ${config.title.toLowerCase()} document`}
      />
      <LegalDocumentView
        document={document}
        onPublish={openPublishModal}
        onDelete={handleDelete}
      />

      <PublishModal
        opened={publishModalOpened}
        onClose={closePublishModal}
        onConfirm={handlePublishConfirm}
        isLoading={publishDocument.isPending}
        documentVersion={document.version}
      />
    </>
  );
}
