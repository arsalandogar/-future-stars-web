import { useEffect, useMemo } from 'react';
import { Container } from '@mantine/core';
import { getRouteApi } from '@tanstack/react-router';

import { Head } from '@/components/seo/head';

import type { BrowseTemplate } from '@/features/templates-browse';

import { useBuilderTemplates } from '../api/browse-templates';
import { BuilderHeader } from '../components/builder-header';
import { BuilderTabsPanel } from '../components/builder-tabs-panel';
import { CardPreview } from '../components/card-preview';
import { useCardBuilderStore } from '../stores/card-builder-store';

import styles from './create-card-page.module.css';

const routeApi = getRouteApi('/_authenticated/_customer/create-card');

export function CreateCardPage() {
  const { templateId } = routeApi.useSearch();
  const reset = useCardBuilderStore((s) => s.reset);

  const { data, isLoading } = useBuilderTemplates();
  const tags = useMemo(() => data?.data ?? [], [data]);

  // Reset store on unmount
  useEffect(() => {
    return () => reset();
  }, [reset]);

  const selectedTemplate = useMemo<BrowseTemplate | null>(() => {
    if (!templateId) return null;
    for (const tag of tags) {
      const found = tag.templates.find((t) => t.id === templateId);
      if (found) return found;
    }
    return null;
  }, [templateId, tags]);

  return (
    <>
      <Head title="Create Card" description="Create your custom sports card" />
      <Container size="xl" className={styles.container}>
        <BuilderHeader canSave={!!templateId} />

        <div className={styles.layout}>
          <div className={styles.preview}>
            <CardPreview template={selectedTemplate} />
          </div>

          <div className={styles.panel}>
            <BuilderTabsPanel tags={tags} isLoadingTemplates={isLoading} />
          </div>
        </div>
      </Container>
    </>
  );
}
