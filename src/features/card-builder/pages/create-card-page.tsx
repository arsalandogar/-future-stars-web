import { useCallback, useEffect, useMemo } from 'react';
import { Container } from '@mantine/core';
import { getRouteApi } from '@tanstack/react-router';

import { Head } from '@/components/seo/head';
import type { EditableFieldId } from '@/features/templates';
import { useTemplate } from '@/features/templates-browse';
import type { SvgJsonNode } from '@/types/svg';
import type { SvgRenderOptions } from '@/components/svg-renderer/svg-renderer';

import { useTemplateSvgJson } from '../api/get-template-svg-json';
import { BuilderHeader } from '../components/builder-header';
import { BuilderTabsPanel } from '../components/builder-tabs-panel';
import { CardPreview } from '../components/card-preview';
import { TOUCH_TARGET_ATTR, TOUCH_TARGET_TYPE_ATTR } from '@fs-card-engine';

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
  const initializeSideFromSvg = useCardEditorStore(
    (s) => s.initializeSideFromSvg
  );
  const resetEditor = useCardEditorStore((s) => s.reset);
  const setFocusedFieldId = useCardEditorStore((s) => s.setFocusedFieldId);
  const activeSide = useCardEditorStore((s) => s.activeSide);
  const workingCopy = useCardEditorStore(
    (s) => s.sides[s.activeSide].workingCopy
  );

  const { previewRef, wasDragRef } = usePreviewGestures();

  const renderOptions = useMemo<SvgRenderOptions>(
    () => ({
      getNodeProps: (node: SvgJsonNode) => {
        // Touch target overlay rects injected by prepareTemplate
        const touchTarget = node.attributes[TOUCH_TARGET_ATTR] as
          | string
          | undefined;
        if (touchTarget) {
          const targetType = node.attributes[TOUCH_TARGET_TYPE_ATTR];
          if (targetType === 'image') {
            return {
              [IMAGE_FIELD_ATTR]: touchTarget,
              style: { cursor: 'pointer', touchAction: 'none' },
              onClick: () => {
                if (wasDragRef.current) return;
                setActiveTab('photo');
                setSelectedImageFieldId(touchTarget as EditableFieldId);
              },
            };
          }
          if (targetType === 'text') {
            return {
              style: { cursor: 'pointer' },
              onClick: () => {
                setActiveTab('content');
                setFocusedFieldId(touchTarget as EditableFieldId);
              },
            };
          }
        }

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

        const fieldId = node.attributes['data-text-field'] as
          | string
          | undefined;

        if (!fieldId) return undefined;

        return {
          style: { cursor: 'pointer' },
          onClick: () => {
            setActiveTab('content');
            setFocusedFieldId(fieldId as EditableFieldId);
          },
        };
      },
    }),
    [setActiveTab, setFocusedFieldId, setSelectedImageFieldId, wasDragRef]
  );

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
            <BuilderTabsPanel />
          </div>
        </div>
      </Container>
    </>
  );
}
