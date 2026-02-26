import { useMemo, useState } from 'react';
import {
  Alert,
  Badge,
  Button,
  ColorSwatch,
  Group,
  Modal,
  ScrollArea,
  Select,
  Stack,
  Text,
} from '@mantine/core';
import { AlertTriangle, Palette, Wand2 } from 'lucide-react';

import { EDITABLE_FIELDS, type EditableFieldId } from '@/features/templates';

import type { DetectedColor } from '../types';
import { useAnnotatorStore } from '../stores/annotator-store';

const COLOR_FIELD_IDS: EditableFieldId[] = [
  'colorOne',
  'colorTwo',
  'colorThree',
  'colorFour',
  'colorFive',
];

const SELECT_OPTIONS = [
  { value: '__skip__', label: 'Skip' },
  ...COLOR_FIELD_IDS.map((id) => ({
    value: id,
    label: EDITABLE_FIELDS[id].label,
  })),
];

interface ColorDetectionModalProps {
  opened: boolean;
  onClose: () => void;
  detectedColors: DetectedColor[];
}

export function ColorDetectionModal({
  opened,
  onClose,
  detectedColors,
}: ColorDetectionModalProps) {
  const bulkAssignColors = useAnnotatorStore((s) => s.bulkAssignColors);

  // Pre-assign first 5 colors to colorOne-colorFive, rest to skip
  const [selections, setSelections] = useState<Record<number, string>>(() =>
    Object.fromEntries(
      detectedColors.map((_, i) => [
        i,
        i < COLOR_FIELD_IDS.length ? COLOR_FIELD_IDS[i] : '__skip__',
      ])
    )
  );

  const hasDuplicateAssignment = useMemo(() => {
    const assigned = Object.values(selections).filter((v) => v !== '__skip__');
    return new Set(assigned).size < assigned.length;
  }, [selections]);

  function handleSelectionChange(index: number, value: string | null) {
    setSelections((prev) => ({ ...prev, [index]: value ?? '__skip__' }));
  }

  function handleApply() {
    const mappings = detectedColors
      .map((color, i) => ({
        fieldId: selections[i] as EditableFieldId,
        occurrences: color.occurrences,
      }))
      .filter((m) => (m.fieldId as string) !== '__skip__');

    bulkAssignColors(mappings);
    onClose();
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="xs">
          <Palette size={18} />
          <Text fw={600}>Detected Colors</Text>
        </Group>
      }
      size="md"
    >
      <Stack gap="md">
        <Text size="sm" c="dimmed">
          {detectedColors.length} distinct color
          {detectedColors.length !== 1 ? 's' : ''} found. Assign each to a color
          variable or skip.
        </Text>

        {hasDuplicateAssignment && (
          <Alert
            icon={<AlertTriangle size={16} />}
            color="yellow"
            variant="light"
          >
            Two or more colors are mapped to the same variable. Each variable
            should have a unique color.
          </Alert>
        )}

        <ScrollArea.Autosize mah={400}>
          <Stack gap="sm">
            {detectedColors.map((color, index) => (
              <Group key={color.hex} gap="sm" wrap="nowrap">
                <ColorSwatch color={color.hex} size={28} />
                <Text size="sm" ff="monospace" style={{ minWidth: 72 }}>
                  {color.hex}
                </Text>
                <Badge variant="light" size="sm">
                  {color.occurrences.length} element
                  {color.occurrences.length !== 1 ? 's' : ''}
                </Badge>
                <Select
                  data={SELECT_OPTIONS}
                  value={selections[index]}
                  onChange={(v) => handleSelectionChange(index, v)}
                  size="xs"
                  style={{ flex: 1 }}
                  allowDeselect={false}
                />
              </Group>
            ))}
          </Stack>
        </ScrollArea.Autosize>

        <Group justify="flex-end">
          <Button variant="subtle" onClick={onClose}>
            Skip
          </Button>
          <Button leftSection={<Wand2 size={16} />} onClick={handleApply}>
            Apply
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
