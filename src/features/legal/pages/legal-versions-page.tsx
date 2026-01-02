import { Anchor, Breadcrumbs, Title } from '@mantine/core';
import { Link } from '@tanstack/react-router';

import { Head } from '@/components/seo/head';

import { LegalVersionHistory } from '../components/legal-version-history';
import { getLegalDocumentConfig, type LegalDocumentType } from '../types';

export interface LegalVersionsPageProps {
  type: LegalDocumentType;
}

export function LegalVersionsPage({ type }: LegalVersionsPageProps) {
  const config = getLegalDocumentConfig(type);
  const basePath = `/admin/legal/${type}`;

  const breadcrumbItems = [
    { title: 'Home', href: '/admin' },
    { title: config.title, href: basePath },
    { title: 'Version History', href: `${basePath}/versions` },
  ];

  return (
    <>
      <Head
        title={`${config.title} Version History`}
        description={`View all published ${config.title.toLowerCase()} versions`}
      />
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <Title order={2}>{config.title} Version History</Title>
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
        <LegalVersionHistory type={type} basePath={basePath} />
      </div>
    </>
  );
}
