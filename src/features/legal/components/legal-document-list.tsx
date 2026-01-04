import { useState } from 'react';
import { Anchor, Button } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { getRouteApi, Link, useNavigate } from '@tanstack/react-router';
import { ExternalLink, Plus } from 'lucide-react';

import { DataTable, type Column } from '@/components/ui/data-table';
import {
  ListingShell,
  useListingContext,
  type ListingTab,
} from '@/components/ui/listing';
import { openDeleteModal } from '@/utils/open-delete-modal';
import { usePageHeader } from '@/hooks/use-page-header';

import { useDeleteLegalDocument } from '../api/delete-legal-document';
import { useLegalDocuments } from '../api/get-legal-documents';
import { usePublishLegalDocument } from '../api/publish-legal-document';
import {
  getLegalDocumentConfig,
  isLegalDocumentType,
  type LegalDocument,
  type LegalDocumentStatus,
} from '../types';

import { LegalDocumentRow } from './legal-document-row';
import { PublishModal } from './publish-modal';

const routeApi = getRouteApi('/_authenticated/admin/_listing/legal/$type');

const COLUMNS: Column[] = [
  { label: 'Version', width: 120 },
  { label: 'Status', width: 100 },
  { label: 'Published At', width: 150 },
  { label: 'Actions', width: 60 },
];

const STATUS_TABS: ListingTab[] = [
  { value: 'all', label: 'All' },
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
];

export function LegalDocumentList() {
  const { type } = routeApi.useParams();
  const { status } = routeApi.useSearch();
  const { page, limit, search } = useListingContext();
  const navigate = useNavigate();

  const [
    publishModalOpened,
    { open: openPublishModal, close: closePublishModal },
  ] = useDisclosure(false);
  const [documentToPublish, setDocumentToPublish] =
    useState<LegalDocument | null>(null);

  const publishDocument = usePublishLegalDocument();
  const deleteDocument = useDeleteLegalDocument();

  const validType = isLegalDocumentType(type) ? type : 'terms';
  const config = getLegalDocumentConfig(validType);

  usePageHeader({
    title: `${config.title} Documents`,
    description: config.description,
  });

  const queryResult = useLegalDocuments({
    variables: {
      page,
      limit,
      type: validType,
      status: status || undefined,
      search: search || undefined,
    },
  });

  if (!isLegalDocumentType(type)) {
    return null;
  }

  const handleStatusChange = (value: string | null) => {
    const newStatus =
      value === 'all' || !value ? undefined : (value as LegalDocumentStatus);
    void navigate({
      to: '.',
      search: (prev) => ({ ...prev, status: newStatus, page: 1 }),
    });
  };

  const handlePublishClick = (doc: LegalDocument) => {
    setDocumentToPublish(doc);
    openPublishModal();
  };

  const handlePublishConfirm = (requiresAcceptance: boolean) => {
    if (!documentToPublish) return;

    publishDocument.mutate(
      { id: documentToPublish.id, requiresAcceptance },
      {
        onSuccess: () => {
          closePublishModal();
          setDocumentToPublish(null);
        },
      }
    );
  };

  const handleDeleteClick = (doc: LegalDocument) => {
    openDeleteModal({
      entityType: 'Document',
      itemName: `version ${doc.version}`,
      onConfirm: () => deleteDocument.mutate(doc.id),
    });
  };

  return (
    <>
      <ListingShell
        tabs={STATUS_TABS}
        activeTab={status ?? 'all'}
        onTabChange={handleStatusChange}
        showFilter={false}
        actions={
          <div className="flex items-center gap-3">
            <Anchor href={config.publicUrl} target="_blank" size="sm">
              <span className="flex items-center gap-1">
                View Public Page <ExternalLink size={14} />
              </span>
            </Anchor>
            <Button
              component={Link}
              to={`./create`}
              leftSection={<Plus size={16} />}
            >
              Create Draft
            </Button>
          </div>
        }
      >
        <DataTable
          queryResult={queryResult}
          columns={COLUMNS}
          emptyMessage="No documents found"
          keyExtractor={(doc) => doc.id}
          renderRow={(doc) => (
            <LegalDocumentRow
              document={doc}
              type={type}
              onPublish={handlePublishClick}
              onDelete={handleDeleteClick}
            />
          )}
        />
      </ListingShell>

      <PublishModal
        opened={publishModalOpened}
        onClose={closePublishModal}
        onConfirm={handlePublishConfirm}
        isLoading={publishDocument.isPending}
        documentVersion={documentToPublish?.version ?? ''}
      />
    </>
  );
}
