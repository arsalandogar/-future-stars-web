import { Anchor, Breadcrumbs, Title } from '@mantine/core';
import { Link, useNavigate } from '@tanstack/react-router';

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

  const breadcrumbItems = [
    { title: 'Home', href: '/admin' },
    { title: config.title, href: basePath },
  ];

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
