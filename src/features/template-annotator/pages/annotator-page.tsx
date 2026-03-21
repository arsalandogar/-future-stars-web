import { useState } from 'react';
import { Badge, ScrollArea, Stack } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

import { Head } from '@/components/seo/head';
import { usePageHeader } from '@/hooks/use-page-header';

import { useAnnotatorStore } from '../stores/annotator-store';
import { AnnotatorCanvas } from '../components/annotator-canvas';
import { AnnotatorToolbar } from '../components/annotator-toolbar';
import { AssignmentSummaryTable } from '../components/assignment-summary-table';
import { BulkTextSettingsPanel } from '../components/bulk-text-settings-modal';
import { DetectionWizardModal } from '../components/detection-wizard-modal';
import { ElementTree } from '../components/element-tree';
import { ExportModal } from '../components/export-modal';
import { FieldAssignmentPanel } from '../components/field-assignment-panel';
import { SvgUploadDropzone } from '../components/svg-upload-dropzone';

import styles from './annotator-page.module.css';

type RightPanelTab = 'assign' | 'review';

const TABS: { value: RightPanelTab; label: string }[] = [
  { value: 'assign', label: 'Assign' },
  { value: 'review', label: 'Review' },
];

export interface AnnotatorPageProps {
  onSave?: () => void;
  isSaving?: boolean;
}

export function AnnotatorPage({ onSave, isSaving }: AnnotatorPageProps) {
  usePageHeader({
    title: 'Template Annotator',
    description: 'Annotate SVG templates with editable fields',
  });

  const svgTree = useAnnotatorStore((s) => s.svgTree);
  const nodeMap = useAnnotatorStore((s) => s.nodeMap);
  const assignments = useAnnotatorStore((s) => s.assignments);
  const [exportOpened, { open: openExport, close: closeExport }] =
    useDisclosure(false);
  const [wizardOpened, { open: openWizard, close: closeWizard }] =
    useDisclosure(false);
  const [textSettingsOpen, setTextSettingsOpen] = useState(false);
  const [rightTab, setRightTab] = useState<RightPanelTab>('assign');

  // Auto-open wizard when a new SVG is loaded (reference identity check)
  const [autoOpenedForMap, setAutoOpenedForMap] = useState<
    typeof nodeMap | null
  >(null);

  if (nodeMap.size > 0 && autoOpenedForMap !== nodeMap) {
    setAutoOpenedForMap(nodeMap);
    if (assignments.length === 0) openWizard();
  }

  const head = (
    <Head
      title="Template Annotator"
      description="Annotate SVG templates with editable fields"
    />
  );

  if (!svgTree) {
    return (
      <>
        {head}
        <div className={styles.uploadContainer}>
          <SvgUploadDropzone />
        </div>
      </>
    );
  }

  return (
    <>
      {head}
      <div className={styles.layout}>
        <div className={styles.toolbar}>
          <AnnotatorToolbar
            onExport={openExport}
            onDetect={openWizard}
            onTextSettings={() => setTextSettingsOpen((prev) => !prev)}
            textSettingsActive={textSettingsOpen}
            onSave={onSave}
            isSaving={isSaving}
          />
        </div>

        <div className={styles.tree}>
          <ElementTree />
        </div>

        <div className={styles.canvas}>
          <AnnotatorCanvas />
        </div>

        <div className={styles.panel}>
          {textSettingsOpen ? (
            <BulkTextSettingsPanel onClose={() => setTextSettingsOpen(false)} />
          ) : (
            <Stack gap={0} h="100%">
              <div className={styles.tabBar} role="tablist">
                {TABS.map((tab) => (
                  <button
                    key={tab.value}
                    className={styles.tab}
                    role="tab"
                    aria-selected={rightTab === tab.value}
                    data-active={rightTab === tab.value}
                    onClick={() => setRightTab(tab.value)}
                  >
                    {tab.label}
                    {tab.value === 'review' && assignments.length > 0 && (
                      <Badge
                        size="xs"
                        variant="filled"
                        circle
                        className={styles.tabBadge}
                      >
                        {assignments.length}
                      </Badge>
                    )}
                  </button>
                ))}
              </div>

              <div className={styles.tabContent}>
                {rightTab === 'assign' && <FieldAssignmentPanel />}

                {rightTab === 'review' && (
                  <ScrollArea h="100%">
                    <div className="p-3">
                      <AssignmentSummaryTable />
                    </div>
                  </ScrollArea>
                )}
              </div>
            </Stack>
          )}
        </div>
      </div>

      <ExportModal opened={exportOpened} onClose={closeExport} />

      {nodeMap.size > 0 && (
        <DetectionWizardModal
          opened={wizardOpened}
          onClose={closeWizard}
          nodeMap={nodeMap}
        />
      )}
    </>
  );
}
