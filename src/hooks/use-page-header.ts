import { useEffect } from 'react';

import { usePageHeaderStore } from '@/stores/page-header-store';

interface PageHeaderOptions {
  title: string;
  description?: string;
  dynamicBreadcrumb?: string;
}

export function usePageHeader({
  title,
  description,
  dynamicBreadcrumb,
}: PageHeaderOptions) {
  const setPageHeader = usePageHeaderStore((s) => s.setPageHeader);
  const resetPageHeader = usePageHeaderStore((s) => s.resetPageHeader);

  useEffect(() => {
    setPageHeader({ title, description, dynamicBreadcrumb });
    return () => resetPageHeader();
  }, [title, description, dynamicBreadcrumb, setPageHeader, resetPageHeader]);
}
