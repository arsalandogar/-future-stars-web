import { Head } from '@/components/seo/head';
import { usePageHeader } from '@/hooks/use-page-header';

import { LegalVersionHistory } from '../components/legal-version-history';
import { getLegalDocumentConfig, type LegalDocumentType } from '../types';

export interface LegalVersionsPageProps {
  type: LegalDocumentType;
}

export function LegalVersionsPage({ type }: LegalVersionsPageProps) {
  const config = getLegalDocumentConfig(type);
  const basePath = `/admin/legal/${type}`;

  usePageHeader({
    title: `${config.title} Version History`,
  });

  return (
    <>
      <Head
        title={`${config.title} Version History`}
        description={`View all published ${config.title.toLowerCase()} versions`}
      />
      <LegalVersionHistory type={type} basePath={basePath} />
    </>
  );
}
