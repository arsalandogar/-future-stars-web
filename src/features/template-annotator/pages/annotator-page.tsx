import { useMemo, useState } from 'react';
import { Button, Stack } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { ClipboardCheck } from 'lucide-react';

import { usePageHeader } from '@/hooks/use-page-header';

import { useAnnotatorStore } from '../stores/annotator-store';
import { AnnotatorCanvas } from '../components/annotator-canvas';
import { AnnotatorToolbar } from '../components/annotator-toolbar';
import { AssignmentSummaryTable } from '../components/assignment-summary-table';
import { ColorDetectionModal } from '../components/color-detection-modal';
import { ElementTree } from '../components/element-tree';
import { ExportModal } from '../components/export-modal';
import { FieldAssignmentPanel } from '../components/field-assignment-panel';
import { SvgUploadDropzone } from '../components/svg-upload-dropzone';
import { ValidationResults } from '../components/validation-results';
import { extractSvgColors } from '../utils/extract-svg-colors';

import styles from './annotator-page.module.css';

type RightPanelTab = 'assign' | 'review' | 'validate';

const TABS: { value: RightPanelTab; label: string }[] = [
  { value: 'assign', label: 'Assign' },
  { value: 'review', label: 'Review' },
  { value: 'validate', label: 'Validate' },
];

export function AnnotatorPage() {
  usePageHeader({
    title: 'Template Annotator',
    description: 'Annotate SVG templates with editable fields',
  });

  const svgTree = useAnnotatorStore((s) => s.svgTree);
  const nodeMap = useAnnotatorStore((s) => s.nodeMap);
  const validate = useAnnotatorStore((s) => s.validate);
  const [exportOpened, { open: openExport, close: closeExport }] =
    useDisclosure(false);
  const [rightTab, setRightTab] = useState<RightPanelTab>('assign');

  // Track which nodeMap the user has dismissed the modal for (reference identity)
  const [dismissedForMap, setDismissedForMap] = useState<typeof nodeMap | null>(
    null
  );

  const detectedColors = useMemo(() => extractSvgColors(nodeMap), [nodeMap]);

  const colorModalOpened =
    detectedColors.length > 0 && dismissedForMap !== nodeMap;

  function closeColorModal() {
    setDismissedForMap(nodeMap);
  }

  if (!svgTree) {
    return (
      <div className={styles.uploadContainer}>
        <SvgUploadDropzone />
      </div>
    );
  }

  return (
    <>
      <div className={styles.layout}>
        <div className={styles.toolbar}>
          <AnnotatorToolbar onExport={openExport} />
        </div>

        <div className={styles.tree}>
          <ElementTree />
        </div>

        <div className={styles.canvas}>
          <AnnotatorCanvas />
        </div>

        <div className={styles.panel}>
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
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto">
              {rightTab === 'assign' && <FieldAssignmentPanel />}

              {rightTab === 'review' && (
                <div className="p-3">
                  <AssignmentSummaryTable />
                </div>
              )}

              {rightTab === 'validate' && (
                <Stack gap="md" p="md">
                  <Button
                    variant="light"
                    leftSection={<ClipboardCheck size={16} />}
                    onClick={validate}
                    fullWidth
                  >
                    Run Validation
                  </Button>
                  <ValidationResults />
                </Stack>
              )}
            </div>
          </Stack>
        </div>
      </div>

      <ExportModal opened={exportOpened} onClose={closeExport} />
      {detectedColors.length > 0 && (
        <ColorDetectionModal
          opened={colorModalOpened}
          onClose={closeColorModal}
          detectedColors={detectedColors}
        />
      )}
    </>
  );
}
