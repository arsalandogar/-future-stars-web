import { useEffect, useMemo } from 'react';
import { Container } from '@mantine/core';
import { getRouteApi } from '@tanstack/react-router';

import { Head } from '@/components/seo/head';

import { useBuilderTemplates } from '../api/browse-templates';
import { useTemplateSvgJson } from '../api/get-template-svg-json';
import { BuilderHeader } from '../components/builder-header';
import { BuilderTabsPanel } from '../components/builder-tabs-panel';
import { CardPreview } from '../components/card-preview';
import { useCardBuilderStore } from '../stores/card-builder-store';
import { cloneWithStableIds } from '../utils/svg-tree';

import styles from './create-card-page.module.css';

const routeApi = getRouteApi('/_authenticated/_customer/create-card');

export function CreateCardPage() {
  const { templateId } = routeApi.useSearch();
  const reset = useCardBuilderStore((s) => s.reset);

  const { data, isLoading: isLoadingTemplates } = useBuilderTemplates();
  const tags = data?.data ?? [];

  const {
    data: originalSvgNode,
    isLoading: isLoadingSvg,
    isError,
    refetch,
  } = useTemplateSvgJson({
    variables: templateId ?? 0,
    enabled: templateId != null,
  });

  const workingCopy = useMemo(
    () => (originalSvgNode ? cloneWithStableIds(originalSvgNode) : null),
    [originalSvgNode]
  );

  useEffect(() => {
    return () => reset();
  }, [reset]);

  const hasTemplate = templateId != null;

  return (
    <>
      <Head title="Create Card" description="Create your custom sports card" />
      <Container size="xl" className={styles.container}>
        <BuilderHeader canSave={hasTemplate} />

        <div className={styles.layout}>
          <div className={styles.preview}>
            <CardPreview
              svgNode={workingCopy}
              isLoading={hasTemplate && isLoadingSvg}
              isError={isError}
              onRetry={() => void refetch()}
              hasTemplate={hasTemplate}
            />
          </div>

          <div className={styles.panel}>
            <BuilderTabsPanel
              tags={tags}
              isLoadingTemplates={isLoadingTemplates}
            />
          </div>
        </div>
      </Container>
    </>
  );
}
