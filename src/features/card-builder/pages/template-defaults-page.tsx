import { useEffect } from 'react';
import { Button, Container, Group } from '@mantine/core';
import { ArrowLeft, Save } from 'lucide-react';

import { Head } from '@/components/seo/head';
import { usePageHeader } from '@/hooks/use-page-header';
import type { SvgJsonNode } from '@/types/svg';

import {
  cloneWithStableIds,
  discoverEditableTextFields,
  discoverEditableColorFields,
  discoverEditableImageFields,
  applyEdits,
} from '@fs-card-engine';

import { BuilderTabsPanel } from '../components/builder-tabs-panel';
import { CardPreview } from '../components/card-preview';
import { useCardPreviewRenderOptions } from '../hooks/use-card-preview-render-options';
import { usePreviewGestures } from '../hooks/use-preview-gestures';
import { useCardBuilderStore } from '../stores/card-builder-store';
import { useCardEditorStore } from '../stores/card-editor-store';
import { useImageUploadStore } from '../stores/image-upload-store';

import styles from './card-builder-layout.module.css';

interface TemplateDefaultsPageProps {
  id: number;
  svgNode: SvgJsonNode;
  onSave: (params: { id: number; svgJson: SvgJsonNode }) => void;
  onBack: () => void;
  isSaving: boolean;
}

export function TemplateDefaultsPage({
  id,
  svgNode,
  onSave,
  onBack,
  isSaving,
}: TemplateDefaultsPageProps) {
  usePageHeader({
    title: 'Edit Defaults',
    description: 'Edit template default values',
  });

  const resetBuilder = useCardBuilderStore((s) => s.reset);
  const initializeSideFromSvg = useCardEditorStore(
    (s) => s.initializeSideFromSvg
  );
  const resetEditor = useCardEditorStore((s) => s.reset);
  const workingCopy = useCardEditorStore((s) => s.sides.front.workingCopy);

  const { previewRef, wasDragRef } = usePreviewGestures();
  const renderOptions = useCardPreviewRenderOptions(wasDragRef);

  // Initialize editor when SVG loads
  useEffect(() => {
    initializeSideFromSvg('front', svgNode);
  }, [svgNode, initializeSideFromSvg]);

  // Clean up stores on unmount
  useEffect(() => {
    return () => {
      resetBuilder();
      resetEditor();
      useImageUploadStore.getState().reset();
    };
  }, [resetBuilder, resetEditor]);

  const handleSave = () => {
    // Clone the original SVG (clean copy without touch targets)
    const clone = cloneWithStableIds(svgNode);

    // Discover editable fields on the clone
    const fields = {
      textFields: discoverEditableTextFields(clone),
      colorFields: discoverEditableColorFields(clone),
      imageFields: discoverEditableImageFields(clone),
    };

    // Apply current edits to the clone
    const { frontEdits } = useCardEditorStore.getState().getEditsForSave();
    applyEdits(fields, frontEdits);

    // Save the modified SVG
    onSave({ id, svgJson: clone });
  };

  return (
    <>
      <Head title="Edit Defaults" />
      <Container size="xl" className={styles.container}>
        <Group justify="space-between" mb="md">
          <Button
            variant="subtle"
            leftSection={<ArrowLeft size={16} />}
            onClick={onBack}
          >
            Back to Template
          </Button>
          <Button
            leftSection={<Save size={16} />}
            loading={isSaving}
            onClick={handleSave}
          >
            Save Defaults
          </Button>
        </Group>

        <div className={styles.layout}>
          <div ref={previewRef} className={styles.preview}>
            <CardPreview
              svgNode={workingCopy}
              isLoading={false}
              isError={false}
              onRetry={() => {}}
              hasTemplate
              onSelectTemplate={() => {}}
              options={renderOptions}
            />
          </div>

          <div className={styles.panel}>
            <BuilderTabsPanel defaultTab="content" showTemplatesTab={false} />
          </div>
        </div>
      </Container>
    </>
  );
}
