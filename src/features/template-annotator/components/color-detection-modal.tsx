import { useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Group,
  Modal,
  ScrollArea,
  Select,
  Slider,
  Stack,
  Text,
} from '@mantine/core';
import { AlertTriangle, Palette, Wand2 } from 'lucide-react';

import type { SvgJsonNode } from '@/types/svg';
import {
  computeOklabOffset,
  type ClusterMember,
  type ColorCluster,
} from '@/utils/color-math';
import { EDITABLE_FIELDS, type EditableFieldId } from '@/features/templates';

import { useAnnotatorStore } from '../stores/annotator-store';
import { extractColorClusters } from '../utils/extract-svg-colors';

function clusterOccurrenceCount(cluster: ColorCluster): number {
  return cluster.members.reduce((s, m) => s + m.occurrences.length, 0);
}

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

type SelectionValue = EditableFieldId | '__skip__';

interface ColorDetectionModalProps {
  opened: boolean;
  onClose: () => void;
  nodeMap: Map<string, SvgJsonNode>;
}

export function ColorDetectionModal({
  opened,
  onClose,
  nodeMap,
}: ColorDetectionModalProps) {
  const bulkAssignColors = useAnnotatorStore((s) => s.bulkAssignColors);

  const [threshold, setThreshold] = useState(30);

  const colorClusters = useMemo(
    () => extractColorClusters(nodeMap, threshold),
    [nodeMap, threshold]
  );

  function buildDefaultSelections(): Record<number, SelectionValue> {
    return Object.fromEntries(
      colorClusters.map((_, i) => [
        i,
        i < COLOR_FIELD_IDS.length ? COLOR_FIELD_IDS[i] : '__skip__',
      ])
    );
  }

  // Pre-assign first 5 clusters to colorOne-colorFive, rest to skip
  const [selections, setSelections] = useState<Record<number, SelectionValue>>(
    buildDefaultSelections
  );

  // Re-sync selections when threshold changes
  const [prevThreshold, setPrevThreshold] = useState(threshold);
  if (threshold !== prevThreshold) {
    setPrevThreshold(threshold);
    setSelections(buildDefaultSelections());
  }

  const hasDuplicateAssignment = useMemo(() => {
    const assigned = Object.values(selections).filter((v) => v !== '__skip__');
    return new Set(assigned).size < assigned.length;
  }, [selections]);

  function handleSelectionChange(index: number, value: string | null) {
    setSelections((prev) => ({
      ...prev,
      [index]: (value ?? '__skip__') as SelectionValue,
    }));
  }

  function handleApply() {
    // Group clusters by their assigned field, merging those that share one
    const grouped = new Map<EditableFieldId, ColorCluster[]>();

    for (let i = 0; i < colorClusters.length; i++) {
      const selection = selections[i];
      if (selection === '__skip__') continue;

      const existing = grouped.get(selection);
      if (existing) {
        existing.push(colorClusters[i]);
      } else {
        grouped.set(selection, [colorClusters[i]]);
      }
    }

    const mappings = Array.from(grouped, ([fieldId, clusters]) => {
      if (clusters.length === 1) {
        return { fieldId, members: clusters[0].members };
      }

      // Multiple clusters → pick the base from the cluster with most occurrences
      const sorted = [...clusters].sort(
        (a, b) => clusterOccurrenceCount(b) - clusterOccurrenceCount(a)
      );
      const baseHex = sorted[0].baseHex;

      // Recompute all offsets relative to the unified base
      const members: ClusterMember[] = clusters.flatMap((c) =>
        c.members.map((m) => ({
          ...m,
          offset: computeOklabOffset(baseHex, m.hex),
        }))
      );

      return { fieldId, members };
    });

    bulkAssignColors(mappings);
    onClose();
  }

  const totalElements = colorClusters.reduce(
    (sum, c) => sum + clusterOccurrenceCount(c),
    0
  );

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
          {colorClusters.length} color group
          {colorClusters.length !== 1 ? 's' : ''} found across {totalElements}{' '}
          element{totalElements !== 1 ? 's' : ''}.
        </Text>

        <div>
          <Text size="xs" c="dimmed" mb={4}>
            Cluster threshold
          </Text>
          <Slider
            defaultValue={threshold}
            onChangeEnd={setThreshold}
            min={0}
            max={100}
            label={(v) => String(v)}
            size="sm"
          />
        </div>

        {hasDuplicateAssignment && (
          <Alert
            icon={<AlertTriangle size={16} />}
            color="blue"
            variant="light"
          >
            Multiple groups share a variable — they will be merged with
            per-element shade offsets.
          </Alert>
        )}

        <ScrollArea.Autosize mah={360}>
          <table className="w-full border-collapse">
            <tbody>
              {colorClusters.map((cluster, index) => {
                const elementCount = clusterOccurrenceCount(cluster);
                const shadeCount = cluster.members.length;
                const hasShades = shadeCount > 1;

                return (
                  <tr key={cluster.baseHex}>
                    <td className="w-7 py-1.5 pr-2 align-middle">
                      <div
                        className="size-5 shrink-0 rounded-sm"
                        style={{ backgroundColor: cluster.baseHex }}
                      />
                    </td>
                    <td className="whitespace-nowrap py-1.5 pr-2 align-middle">
                      <Text size="sm" ff="monospace" lh={1}>
                        {cluster.baseHex}
                      </Text>
                    </td>
                    <td className="whitespace-nowrap py-1.5 pr-2 align-middle">
                      <Text size="xs" c="dimmed" lh={1}>
                        {elementCount} el
                        {hasShades ? `, ${shadeCount} shades` : ''}
                      </Text>
                    </td>
                    <td className="w-32 py-1.5 align-middle">
                      <Select
                        data={SELECT_OPTIONS}
                        value={selections[index]}
                        onChange={(v) => handleSelectionChange(index, v)}
                        size="xs"
                        allowDeselect={false}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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
