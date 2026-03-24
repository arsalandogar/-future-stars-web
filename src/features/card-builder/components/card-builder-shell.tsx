import { useCallback, useEffect } from 'react';
import { Container } from '@mantine/core';

import { useTemplateSvgJson } from '@/features/templates';

import type { PersistCardPayload } from '../api/save-card';
import { BuilderHeader } from '../components/builder-header';
import { BuilderTabsPanel } from '../components/builder-tabs-panel';
import { CardPreview } from '../components/card-preview';
import { useCardPreviewRenderOptions } from '../hooks/use-card-preview-render-options';
import { usePreviewGestures } from '../hooks/use-preview-gestures';
import { useCardBuilderStore } from '../stores/card-builder-store';
import { useCardEditorStore } from '../stores/card-editor-store';
import { useImageUploadStore } from '../stores/image-upload-store';

import styles from './card-builder-layout.module.css';

interface CardBuilderShellProps {
  templateId: number | null;
  backTemplateId: number | null;
  isSaving: boolean;
  onSave: (payload: PersistCardPayload) => void;
}

export function CardBuilderShell({
  templateId,
  backTemplateId,
  isSaving,
  onSave,
}: CardBuilderShellProps) {
  const resetBuilder = useCardBuilderStore((s) => s.reset);
  const setActiveTab = useCardBuilderStore((s) => s.setActiveTab);
  const initializeSideFromSvg = useCardEditorStore(
    (s) => s.initializeSideFromSvg
  );
  const resetSide = useCardEditorStore((s) => s.resetSide);
  const resetEditor = useCardEditorStore((s) => s.reset);
  const activeSide = useCardEditorStore((s) => s.activeSide);
  const workingCopy = useCardEditorStore(
    (s) => s.sides[s.activeSide].workingCopy
  );

  const { previewRef, wasDragRef } = usePreviewGestures();
  const renderOptions = useCardPreviewRenderOptions(wasDragRef);

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
    if (templateId == null) {
      resetSide('front');
      return;
    }

    initializeSideFromSvg('front', originalSvgNode ?? undefined);
  }, [templateId, originalSvgNode, initializeSideFromSvg, resetSide]);

  useEffect(() => {
    if (backTemplateId == null) {
      resetSide('back');
      return;
    }

    initializeSideFromSvg('back', backSvgNode ?? undefined);
  }, [backTemplateId, backSvgNode, initializeSideFromSvg, resetSide]);

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

  const handleSelectTemplate = useCallback(() => {
    setActiveTab('templates');
  }, [setActiveTab]);

  const hasTemplate = templateId != null;
  const isPreviewLoading =
    hasTemplate && (activeSide === 'front' ? isLoadingSvg : isLoadingBackSvg);
  const isPreviewError =
    hasTemplate && (activeSide === 'front' ? isErrorSvg : isErrorBackSvg);

  return (
    <Container size="xl" className={styles.container}>
      <BuilderHeader
        canSave={hasTemplate}
        templateId={templateId ?? undefined}
        backTemplateId={backTemplateId}
        isSaving={isSaving}
        onSave={onSave}
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
  );
}
