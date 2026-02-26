import { useCallback, useEffect } from 'react';
import { Container } from '@mantine/core';
import { getRouteApi } from '@tanstack/react-router';

import { Head } from '@/components/seo/head';
import type { SvgJsonNode } from '@/types/svg';
import type { SvgRenderOptions } from '@/components/svg-renderer/svg-renderer';

import { useBuilderTemplates } from '../api/browse-templates';
import { useTemplateSvgJson } from '../api/get-template-svg-json';
import { BuilderHeader } from '../components/builder-header';
import { BuilderTabsPanel } from '../components/builder-tabs-panel';
import { CardPreview } from '../components/card-preview';
import { useCardBuilderStore } from '../stores/card-builder-store';
import { useCardEditorStore } from '../stores/card-editor-store';

import styles from './create-card-page.module.css';

const routeApi = getRouteApi('/_authenticated/_customer/create-card');

function getNodeProps(node: SvgJsonNode): Record<string, unknown> | undefined {
  if (node.name !== 'text') return undefined;

  const maxWidth = node.attributes['data-max-width'];
  if (!maxWidth) return undefined;

  return {
    textLength: maxWidth,
    lengthAdjust: 'spacingAndGlyphs',
  };
}

const renderOptions: SvgRenderOptions = { getNodeProps };

export function CreateCardPage() {
  const { templateId } = routeApi.useSearch();
  const resetBuilder = useCardBuilderStore((s) => s.reset);
  const initializeFromSvg = useCardEditorStore((s) => s.initializeFromSvg);
  const resetEditor = useCardEditorStore((s) => s.reset);
  const workingCopy = useCardEditorStore((s) => s.workingCopy);

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

  useEffect(() => {
    if (originalSvgNode) {
      initializeFromSvg(originalSvgNode);
    }
  }, [originalSvgNode, initializeFromSvg]);

  useEffect(() => {
    return () => {
      resetBuilder();
      resetEditor();
    };
  }, [resetBuilder, resetEditor]);

  const handleRetry = useCallback(() => void refetch(), [refetch]);

  const hasTemplate = templateId != null;

  return (
    <>
      <Head title="Create Card" description="Create your custom sports card" />
      <Container size="xl" className={styles.container}>
        <BuilderHeader canSave={hasTemplate} templateId={templateId} />

        <div className={styles.layout}>
          <div className={styles.preview}>
            <CardPreview
              svgNode={workingCopy}
              isLoading={hasTemplate && isLoadingSvg}
              isError={isError}
              onRetry={handleRetry}
              hasTemplate={hasTemplate}
              options={renderOptions}
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
