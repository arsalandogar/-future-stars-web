import { useMemo } from 'react';
import {
  Button,
  Code,
  CopyButton,
  Group,
  Modal,
  ScrollArea,
  Stack,
} from '@mantine/core';
import { Check, Clipboard, Download } from 'lucide-react';

import { useAnnotatorStore } from '../stores/annotator-store';
import { downloadJson, exportToJson } from '../utils/export-annotated-svg';

interface ExportModalProps {
  opened: boolean;
  onClose: () => void;
}

export function ExportModal({ opened, onClose }: ExportModalProps) {
  const svgTree = useAnnotatorStore((s) => s.svgTree);
  const assignments = useAnnotatorStore((s) => s.assignments);
  const fileName = useAnnotatorStore((s) => s.fileName);

  const json = useMemo(() => {
    if (!svgTree) return '';
    return exportToJson(svgTree, assignments);
  }, [svgTree, assignments]);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Export Annotated SVG"
      size="lg"
    >
      <Stack gap="md">
        <ScrollArea h={400}>
          <Code block>{json}</Code>
        </ScrollArea>

        <Group justify="flex-end">
          <CopyButton value={json}>
            {({ copied, copy }) => (
              <Button
                variant="light"
                leftSection={
                  copied ? <Check size={16} /> : <Clipboard size={16} />
                }
                onClick={copy}
              >
                {copied ? 'Copied' : 'Copy to Clipboard'}
              </Button>
            )}
          </CopyButton>

          <Button
            leftSection={<Download size={16} />}
            onClick={() => downloadJson(json, fileName ?? 'template')}
          >
            Download JSON
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
