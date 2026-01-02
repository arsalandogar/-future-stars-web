import { useState } from 'react';
import {
  Button,
  Card,
  Group,
  Select,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useDebouncedCallback, useDisclosure } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { Link } from '@tanstack/react-router';
import { Plus, Search } from 'lucide-react';

import { DataTable, type Column } from '@/components/ui/data-table';

import { useLegalDocuments } from '../api/get-legal-documents';
import { usePublishLegalDocument } from '../api/publish-legal-document';
import { useDeleteLegalDocument } from '../api/delete-legal-document';
import type {
  LegalDocument,
  LegalDocumentType,
  LegalDocumentStatus,
} from '../types';

import { LegalDocumentRow } from './legal-document-row';
import { PublishModal } from './publish-modal';

const COLUMNS: Column[] = [
  { label: 'Version', width: 120 },
  { label: 'Status', width: 100 },
  { label: 'Published At', width: 150 },
  { label: 'Actions', width: 60 },
];

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
];

interface LegalDocumentListProps {
  type: LegalDocumentType;
  title: string;
  description: string;
  searchParams: {
    page: number;
    status?: LegalDocumentStatus;
    search: string;
  };
  onSearchChange: (search: string) => void;
  onStatusChange: (status: LegalDocumentStatus | undefined) => void;
  onPageChange: (page: number) => void;
  createPath: string;
}

export function LegalDocumentList({
  type,
  title,
  description,
  searchParams,
  onSearchChange,
  onStatusChange,
  onPageChange,
  createPath,
}: LegalDocumentListProps) {
  const { page, status, search } = searchParams;

  const [
    publishModalOpened,
    { open: openPublishModal, close: closePublishModal },
  ] = useDisclosure(false);
  const [documentToPublish, setDocumentToPublish] =
    useState<LegalDocument | null>(null);

  const publishDocument = usePublishLegalDocument();
  const deleteDocument = useDeleteLegalDocument();

  const handleSearchChange = useDebouncedCallback((newSearch: string) => {
    onSearchChange(newSearch);
  }, 300);

  const handleStatusChange = (newStatus: string | null) => {
    onStatusChange((newStatus || undefined) as LegalDocumentStatus | undefined);
  };

  const { data, isLoading } = useLegalDocuments({
    variables: {
      page,
      limit: 20,
      type,
      status: status || undefined,
      search: search || undefined,
    },
  });

  const documents = data?.data ?? [];
  const meta = data?.meta;

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
    modals.openConfirmModal({
      title: <Text fw={700}>Delete Document</Text>,
      centered: true,
      children: (
        <Text size="sm">
          Are you sure you want to delete version <strong>{doc.version}</strong>
          ? This action cannot be undone.
        </Text>
      ),
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: () => {
        deleteDocument.mutate(doc.id);
      },
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <Card withBorder radius="md" p="lg">
        <div className="flex flex-col gap-6">
          <Group justify="space-between" align="flex-start">
            <div>
              <Title order={4}>{title}</Title>
              <Text size="sm" c="dimmed">
                {description}
              </Text>
            </div>
            <Button
              component={Link}
              to={createPath}
              leftSection={<Plus size={16} />}
              aria-label="Create new draft document"
            >
              Create Draft
            </Button>
          </Group>

          <Group justify="space-between">
            <TextInput
              placeholder="Search..."
              leftSection={<Search size={16} />}
              defaultValue={search}
              onChange={(e) => handleSearchChange(e.currentTarget.value)}
              className="w-80"
            />
            <Select
              placeholder="Filter by status"
              data={STATUS_OPTIONS}
              value={status ?? ''}
              onChange={handleStatusChange}
              clearable={false}
              className="w-40"
            />
          </Group>

          <DataTable
            data={documents}
            columns={COLUMNS}
            isLoading={isLoading}
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
            pagination={
              meta && meta.lastPage > 1
                ? { page, total: meta.lastPage, onChange: onPageChange }
                : undefined
            }
          />
        </div>
      </Card>

      <PublishModal
        opened={publishModalOpened}
        onClose={closePublishModal}
        onConfirm={handlePublishConfirm}
        isLoading={publishDocument.isPending}
        documentVersion={documentToPublish?.version ?? ''}
      />
    </div>
  );
}
