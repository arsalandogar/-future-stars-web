import { Anchor, Title } from '@mantine/core';
import { useNavigate } from '@tanstack/react-router';
import { ExternalLink } from 'lucide-react';

import { Head } from '@/components/seo/head';

import { LegalDocumentList } from '../components/legal-document-list';
import {
  getLegalDocumentConfig,
  type LegalDocumentStatus,
  type LegalDocumentType,
} from '../types';

export interface LegalListPageProps {
  type: LegalDocumentType;
  searchParams: {
    page: number;
    status?: LegalDocumentStatus;
    search: string;
  };
}

export function LegalListPage({ type, searchParams }: LegalListPageProps) {
  const navigate = useNavigate();
  const { page, status, search } = searchParams;

  const config = getLegalDocumentConfig(type);
  const basePath = `/admin/legal/${type}`;

  const handleSearchChange = (newSearch: string) => {
    void navigate({
      to: basePath,
      search: { page: 1, search: newSearch },
      replace: true,
    });
  };

  const handleStatusChange = (newStatus: LegalDocumentStatus | undefined) => {
    void navigate({
      to: basePath,
      search: { page: 1, status: newStatus },
      replace: true,
    });
  };

  const handlePageChange = (newPage: number) => {
    void navigate({
      to: basePath,
      search: (prev) => ({ ...prev, page: newPage }),
    });
  };

  return (
    <>
      <Head
        title={config.title}
        description={`Manage ${config.title.toLowerCase()} documents`}
      />
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <Title order={2}>{config.title}</Title>
          <Anchor href={config.publicUrl} target="_blank" size="sm">
            <span className="flex items-center gap-1">
              View Public Page <ExternalLink size={14} />
            </span>
          </Anchor>
        </div>
        <LegalDocumentList
          type={type}
          title={`${config.title} Documents`}
          description={config.description}
          searchParams={{ page, status, search }}
          onSearchChange={handleSearchChange}
          onStatusChange={handleStatusChange}
          onPageChange={handlePageChange}
          createPath={`${basePath}/create`}
        />
      </div>
    </>
  );
}
