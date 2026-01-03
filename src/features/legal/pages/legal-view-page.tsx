import { Anchor, Breadcrumbs, Loader, Text, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { Link, useNavigate } from '@tanstack/react-router';

import { Head } from '@/components/seo/head';

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
  const basePath = `/admin/legal/${type}`;

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

  const breadcrumbItems = [
    { title: 'Home', href: '/admin' },
    { title: config.title, href: basePath },
    { title: document?.version ?? 'View', href: `${basePath}/${id}` },
  ];

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
    modals.openConfirmModal({
      title: <Text fw={700}>Delete Document</Text>,
      centered: true,
      children: (
        <Text size="sm">
          Are you sure you want to delete version{' '}
          <strong>{document?.version}</strong>? This action cannot be undone.
        </Text>
      ),
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
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
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <Title order={2}>{config.title}</Title>
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
        <LegalDocumentView
          document={document}
          onPublish={openPublishModal}
          onDelete={handleDelete}
        />
      </div>

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
