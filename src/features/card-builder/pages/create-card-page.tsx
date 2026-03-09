import { useCallback, useEffect } from 'react';
import { Container } from '@mantine/core';
import { getRouteApi } from '@tanstack/react-router';

import { Head } from '@/components/seo/head';
import { useTemplate } from '@/features/templates-browse';

import { useTemplateSvgJson } from '@/features/templates';
import { BuilderHeader } from '../components/builder-header';
import { BuilderTabsPanel } from '../components/builder-tabs-panel';
import { CardPreview } from '../components/card-preview';
import { useCardPreviewRenderOptions } from '../hooks/use-card-preview-render-options';
import { usePreviewGestures } from '../hooks/use-preview-gestures';
import { useCardBuilderStore } from '../stores/card-builder-store';
import { useCardEditorStore } from '../stores/card-editor-store';
import { useImageUploadStore } from '../stores/image-upload-store';

import styles from './card-builder-layout.module.css';

const routeApi = getRouteApi('/_authenticated/_customer/create-card');

export function CreateCardPage() {
  const { templateId } = routeApi.useSearch();

  const resetBuilder = useCardBuilderStore((s) => s.reset);
  const setActiveTab = useCardBuilderStore((s) => s.setActiveTab);
  const initializeSideFromSvg = useCardEditorStore(
    (s) => s.initializeSideFromSvg
  );
  const resetEditor = useCardEditorStore((s) => s.reset);
  const activeSide = useCardEditorStore((s) => s.activeSide);
  const workingCopy = useCardEditorStore(
    (s) => s.sides[s.activeSide].workingCopy
  );

  const { previewRef, wasDragRef } = usePreviewGestures();
  const renderOptions = useCardPreviewRenderOptions(wasDragRef);

  // Fetch single template to resolve backTemplateId
  const { data: selectedTemplate } = useTemplate({
    variables: templateId ?? 0,
    enabled: templateId != null,
  });

  const backTemplateId = selectedTemplate?.backTemplateId ?? null;

  const {
    data: originalSvgNode,
    isLoading: isLoadingSvg,
    isError: isErrorSvg,
    refetch: refetchFrontSvg,
  } = useTemplateSvgJson({
    variables: templateId ?? 0,
    enabled: templateId != null,
  });

  const {
    data: backSvgNode,
    isLoading: isLoadingBackSvg,
    isError: isErrorBackSvg,
    refetch: refetchBackSvg,
  } = useTemplateSvgJson({
    variables: backTemplateId ?? 0,
    enabled: backTemplateId != null,
  });

  useEffect(() => {
    initializeSideFromSvg('front', originalSvgNode);
  }, [originalSvgNode, initializeSideFromSvg]);

  useEffect(() => {
    if (!backTemplateId || !backSvgNode) return;
    initializeSideFromSvg('back', backSvgNode);
  }, [backTemplateId, backSvgNode, initializeSideFromSvg]);

  useEffect(() => {
    return () => {
      resetBuilder();
      resetEditor();
      useImageUploadStore.getState().reset();
    };
  }, [resetBuilder, resetEditor]);

  const handleRetry = useCallback(() => {
    if (activeSide === 'front') {
      void refetchFrontSvg();
      return;
    }

    void refetchBackSvg();
  }, [activeSide, refetchFrontSvg, refetchBackSvg]);
  const handleSelectTemplate = useCallback(
    () => setActiveTab('templates'),
    [setActiveTab]
  );

  const hasTemplate = templateId != null;
  const isPreviewLoading =
    hasTemplate && (activeSide === 'front' ? isLoadingSvg : isLoadingBackSvg);
  const isPreviewError =
    hasTemplate && (activeSide === 'front' ? isErrorSvg : isErrorBackSvg);

  return (
    <>
      <Head title="Create Card" description="Create your custom sports card" />
      <Container size="xl" className={styles.container}>
        <BuilderHeader
          canSave={hasTemplate}
          templateId={templateId}
          backTemplateId={backTemplateId}
        />

        <div className={styles.layout}>
          <div ref={previewRef} className={styles.preview}>
            <CardPreview
              svgNode={workingCopy}
              isLoading={isPreviewLoading}
              isError={isPreviewError}
              onRetry={handleRetry}
              hasTemplate={hasTemplate}
              onSelectTemplate={handleSelectTemplate}
              options={renderOptions}
            />
          </div>

          <div className={styles.panel}>
            <BuilderTabsPanel
              defaultTab={hasTemplate ? 'content' : 'templates'}
            />
          </div>
        </div>
      </Container>
    </>
  );
}
