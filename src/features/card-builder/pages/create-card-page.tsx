import { useCallback, useEffect, useMemo } from 'react';
import { Container } from '@mantine/core';
import { getRouteApi } from '@tanstack/react-router';

import { Head } from '@/components/seo/head';
import type { EditableFieldId } from '@/features/templates';
import type { SvgJsonNode } from '@/types/svg';
import type { SvgRenderOptions } from '@/components/svg-renderer/svg-renderer';

import { useBuilderTemplates } from '../api/browse-templates';
import { useTemplateSvgJson } from '../api/get-template-svg-json';
import { BuilderHeader } from '../components/builder-header';
import { BuilderTabsPanel } from '../components/builder-tabs-panel';
import { CardPreview } from '../components/card-preview';
import {
  IMAGE_FIELD_ATTR,
  usePreviewGestures,
} from '../hooks/use-preview-gestures';
import { useCardBuilderStore } from '../stores/card-builder-store';
import { useCardEditorStore } from '../stores/card-editor-store';
import { useImageUploadStore } from '../stores/image-upload-store';

import styles from './create-card-page.module.css';

const routeApi = getRouteApi('/_authenticated/_customer/create-card');

export function CreateCardPage() {
  const { templateId } = routeApi.useSearch();
  const resetBuilder = useCardBuilderStore((s) => s.reset);
  const setActiveTab = useCardBuilderStore((s) => s.setActiveTab);
  const setSelectedImageFieldId = useCardBuilderStore(
    (s) => s.setSelectedImageFieldId
  );
  const initializeFromSvg = useCardEditorStore((s) => s.initializeFromSvg);
  const resetEditor = useCardEditorStore((s) => s.reset);
  const setFocusedFieldId = useCardEditorStore((s) => s.setFocusedFieldId);
  const workingCopy = useCardEditorStore((s) => s.workingCopy);

  const { previewRef, wasDragRef } = usePreviewGestures();

  const renderOptions = useMemo<SvgRenderOptions>(
    () => ({
      getNodeProps: (node: SvgJsonNode) => {
        const imageFieldId = node.attributes['data-image-field'] as
          | string
          | undefined;

        if (imageFieldId) {
          return {
            [IMAGE_FIELD_ATTR]: imageFieldId,
            style: { cursor: 'pointer', touchAction: 'none' },
            onClick: () => {
              if (wasDragRef.current) return;
              setActiveTab('photo');
              setSelectedImageFieldId(imageFieldId as EditableFieldId);
            },
          };
        }

        if (node.name !== 'text') return undefined;

        const maxWidth = node.attributes['data-max-width'];
        const fieldId = node.attributes['data-text-field'] as
          | string
          | undefined;

        if (!maxWidth && !fieldId) return undefined;

        return {
          ...(maxWidth && {
            textLength: maxWidth,
            lengthAdjust: 'spacingAndGlyphs',
          }),
          ...(fieldId && {
            style: { cursor: 'pointer' },
            onClick: () => {
              setActiveTab('content');
              setFocusedFieldId(fieldId as EditableFieldId);
            },
          }),
        };
      },
    }),
    [setActiveTab, setFocusedFieldId, setSelectedImageFieldId, wasDragRef]
  );

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
    initializeFromSvg(originalSvgNode);
  }, [originalSvgNode, initializeFromSvg]);

  useEffect(() => {
    return () => {
      resetBuilder();
      resetEditor();
      useImageUploadStore.getState().reset();
    };
  }, [resetBuilder, resetEditor]);

  const handleRetry = useCallback(() => void refetch(), [refetch]);
  const handleSelectTemplate = useCallback(
    () => setActiveTab('templates'),
    [setActiveTab]
  );

  const hasTemplate = templateId != null;

  return (
    <>
      <Head title="Create Card" description="Create your custom sports card" />
      <Container size="xl" className={styles.container}>
        <BuilderHeader canSave={hasTemplate} templateId={templateId} />

        <div className={styles.layout}>
          <div ref={previewRef} className={styles.preview}>
            <CardPreview
              svgNode={workingCopy}
              isLoading={hasTemplate && isLoadingSvg}
              isError={isError}
              onRetry={handleRetry}
              hasTemplate={hasTemplate}
              onSelectTemplate={handleSelectTemplate}
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
