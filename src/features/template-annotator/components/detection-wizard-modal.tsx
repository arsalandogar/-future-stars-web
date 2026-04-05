import { type ReactNode, useMemo, useState } from 'react';
import {
  Alert,
  Button,
  ColorSwatch,
  Group,
  Modal,
  ScrollArea,
  Select,
  Slider,
  Stack,
  Stepper,
  Text,
} from '@mantine/core';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Image as ImageIcon,
  Palette,
  Type,
  Wand2,
} from 'lucide-react';

import { SvgRenderer } from '@/components/svg-renderer/svg-renderer';
import type { SvgJsonNode } from '@/types/svg';
import {
  writeColorValue,
  applyOklabOffset,
  isZeroOffset,
} from '@fs-card-engine';
import {
  computeOklabOffset,
  type ClusterMember,
  type ColorCluster,
} from '@/utils/color-math';
import { EDITABLE_FIELDS, type EditableFieldId } from '@/features/templates';

import { useAnnotatorStore } from '../stores/annotator-store';
import type { FieldAssignment } from '../types';
import { detectForegroundColors } from '../utils/detect-foreground-colors';
import { extractColorClusters } from '../utils/extract-svg-colors';
import { extractSvgImages } from '../utils/extract-svg-images';
import { extractSvgTexts } from '../utils/extract-svg-texts';
import { querySvgElement } from '../utils/svg-overlay-helpers';
import { FgColorSubStep } from './fg-color-substep';

const SKIP_VALUE = '__skip__' as const;
const NONE_AREA = '__none__' as const;

type SelectionValue = EditableFieldId | typeof SKIP_VALUE;

// ── Field ID lists ────────────────────────────────────────────────

const COLOR_FIELD_IDS: EditableFieldId[] = [
  'colorOne',
  'colorTwo',
  'colorThree',
  'colorFour',
  'colorFive',
];

const TEXT_FIELD_IDS: EditableFieldId[] = [
  'firstName',
  'lastName',
  'fullName',
  'team',
  'position',
  'number',
];

const IMAGE_FIELD_IDS: EditableFieldId[] = [
  'imageOne',
  'imageTwo',
  'imageThree',
  'imageFour',
  'imageFive',
];

// ── Select option builders ────────────────────────────────────────

function buildSelectOptions(fieldIds: EditableFieldId[]) {
  return [
    { value: SKIP_VALUE, label: 'Skip' },
    ...fieldIds.map((id) => ({
      value: id,
      label: EDITABLE_FIELDS[id].label,
    })),
  ];
}

const COLOR_SELECT_OPTIONS = buildSelectOptions(COLOR_FIELD_IDS);
const TEXT_SELECT_OPTIONS = buildSelectOptions(TEXT_FIELD_IDS);
const IMAGE_SELECT_OPTIONS = buildSelectOptions(IMAGE_FIELD_IDS);

// ── Helpers ───────────────────────────────────────────────────────

function clusterOccurrenceCount(cluster: ColorCluster): number {
  return cluster.members.reduce((s, m) => s + m.occurrences.length, 0);
}

function hasDuplicates(selections: Record<number, SelectionValue>): boolean {
  const assigned = Object.values(selections).filter((v) => v !== SKIP_VALUE);
  return new Set(assigned).size < assigned.length;
}

function hasAnyAssignment(selections: Record<number, SelectionValue>): boolean {
  return Object.values(selections).some((v) => v !== SKIP_VALUE);
}

function buildDefaultSelections(
  count: number,
  autoAssignIds?: EditableFieldId[]
): Record<number, SelectionValue> {
  return Object.fromEntries(
    Array.from({ length: count }, (_, i) => [
      i,
      autoAssignIds && i < autoAssignIds.length ? autoAssignIds[i] : SKIP_VALUE,
    ])
  );
}

function buildPreselectedColorSelections(
  colorClusters: ColorCluster[],
  assignments: FieldAssignment[]
): Record<number, SelectionValue> {
  const colorAssignments = assignments.filter(
    (a) => EDITABLE_FIELDS[a.fieldId].type === 'color'
  );

  if (colorAssignments.length === 0) {
    return buildDefaultSelections(colorClusters.length, COLOR_FIELD_IDS);
  }

  // Build lookup: "nodeId:colorTarget" → fieldId
  const occToField = new Map<string, EditableFieldId>();
  for (const a of colorAssignments) {
    if (a.colorTarget) {
      occToField.set(`${a.nodeId}:${a.colorTarget}`, a.fieldId);
    }
  }

  // First pass: find matches
  const matched = new Map<number, EditableFieldId>();
  const usedFieldIds = new Set<EditableFieldId>();

  for (let i = 0; i < colorClusters.length; i++) {
    const cluster = colorClusters[i];
    let foundFieldId: EditableFieldId | null = null;
    for (const member of cluster.members) {
      for (const occ of member.occurrences) {
        const key = `${occ.nodeId}:${occ.colorTarget}`;
        const fieldId = occToField.get(key);
        if (fieldId) {
          foundFieldId = fieldId;
          break;
        }
      }
      if (foundFieldId) break;
    }
    if (foundFieldId) {
      matched.set(i, foundFieldId);
      usedFieldIds.add(foundFieldId);
    }
  }

  // Auto-assign unmatched clusters to next unused color field
  const unusedFieldIds = COLOR_FIELD_IDS.filter((id) => !usedFieldIds.has(id));
  let unusedIdx = 0;

  return Object.fromEntries(
    colorClusters.map((_, i) => {
      if (matched.has(i)) return [i, matched.get(i)!];
      if (unusedIdx < unusedFieldIds.length)
        return [i, unusedFieldIds[unusedIdx++]];
      return [i, SKIP_VALUE];
    })
  );
}

function buildPreselectedNodeSelections(
  detectedItems: { nodeId: string }[],
  assignments: FieldAssignment[],
  type: 'text' | 'image',
  autoAssignIds?: EditableFieldId[]
): Record<number, SelectionValue> {
  const typeAssignments = assignments.filter(
    (a) => EDITABLE_FIELDS[a.fieldId].type === type
  );

  if (typeAssignments.length === 0) {
    return buildDefaultSelections(detectedItems.length, autoAssignIds);
  }

  const nodeToField = new Map<string, EditableFieldId>();
  for (const a of typeAssignments) {
    nodeToField.set(a.nodeId, a.fieldId);
  }

  // Auto-fill unmatched items with next unused field IDs
  const usedFieldIds = new Set(nodeToField.values());
  const unusedFieldIds = autoAssignIds
    ? autoAssignIds.filter((id) => !usedFieldIds.has(id))
    : [];
  let unusedIdx = 0;

  return Object.fromEntries(
    detectedItems.map((item, i) => {
      const existing = nodeToField.get(item.nodeId);
      if (existing) return [i, existing];
      if (unusedIdx < unusedFieldIds.length)
        return [i, unusedFieldIds[unusedIdx++]];
      return [i, SKIP_VALUE];
    })
  );
}

function handleSelectionChange(
  selections: Record<number, SelectionValue>,
  index: number,
  value: string | null,
  onChange: (s: Record<number, SelectionValue>) => void
) {
  onChange({
    ...selections,
    [index]: (value ?? SKIP_VALUE) as SelectionValue,
  });
}

// ── Step definitions ──────────────────────────────────────────────

interface StepDef {
  key: 'color' | 'text' | 'image';
  label: string;
  icon: ReactNode;
}

// ── Color step ────────────────────────────────────────────────────

function ColorStepContent({
  colorClusters,
  threshold,
  onThresholdChange,
  selections,
  onSelectionsChange,
}: {
  colorClusters: ColorCluster[];
  threshold: number;
  onThresholdChange: (threshold: number) => void;
  selections: Record<number, SelectionValue>;
  onSelectionsChange: (s: Record<number, SelectionValue>) => void;
}) {
  const totalElements = colorClusters.reduce(
    (sum, c) => sum + clusterOccurrenceCount(c),
    0
  );

  const duplicates = hasDuplicates(selections);

  return (
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
          value={threshold}
          onChange={onThresholdChange}
          min={0}
          max={100}
          label={(v) => String(v)}
          size="sm"
        />
      </div>

      {duplicates && (
        <Alert icon={<AlertTriangle size={16} />} color="blue" variant="light">
          Multiple groups share a variable — they will be merged with
          per-element shade offsets.
        </Alert>
      )}

      <ScrollArea.Autosize mah={300}>
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
                      data={COLOR_SELECT_OPTIONS}
                      value={selections[index]}
                      onChange={(v) =>
                        handleSelectionChange(
                          selections,
                          index,
                          v,
                          onSelectionsChange
                        )
                      }
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
    </Stack>
  );
}

// ── Text step ─────────────────────────────────────────────────────

export interface ColorAreaBrief {
  fieldId: EditableFieldId;
  label: string;
  bgHex: string;
}

function TextStepContent({
  detectedTexts,
  selections,
  onSelectionsChange,
  colorAreaOptions,
  textAreaSelections,
  onTextAreaSelectionsChange,
  fgSelections,
  bgSelections,
}: {
  detectedTexts: { nodeId: string; textContent: string; tagName: string }[];
  selections: Record<number, SelectionValue>;
  onSelectionsChange: (s: Record<number, SelectionValue>) => void;
  colorAreaOptions: ColorAreaBrief[];
  textAreaSelections: Record<number, string>;
  onTextAreaSelectionsChange: (s: Record<number, string>) => void;
  fgSelections: Record<string, string>;
  bgSelections: Record<string, string>;
}) {
  const duplicates = hasDuplicates(selections);
  const hasColorAreas = colorAreaOptions.length > 0;

  const areaSelectData = [
    { value: NONE_AREA, label: 'None' },
    ...colorAreaOptions.map((o) => ({ value: o.fieldId, label: o.label })),
  ];

  return (
    <Stack gap="md">
      <Text size="sm" c="dimmed">
        {detectedTexts.length} text element
        {detectedTexts.length !== 1 ? 's' : ''} found.
      </Text>

      {duplicates && (
        <Alert icon={<AlertTriangle size={16} />} color="red" variant="light">
          Each text field can only be assigned to one element.
        </Alert>
      )}

      <ScrollArea.Autosize mah={300}>
        <table className="w-full border-collapse">
          <tbody>
            {detectedTexts.map((detected, index) => {
              const preview =
                detected.textContent.length > 30
                  ? detected.textContent.slice(0, 30) + '...'
                  : detected.textContent;

              const areaValue = textAreaSelections[index] ?? NONE_AREA;
              const areaOpt = colorAreaOptions.find(
                (o) => o.fieldId === areaValue
              );

              return (
                <tr key={detected.nodeId}>
                  <td className="py-1.5 pr-2 align-middle">
                    <Text size="sm" lh={1} truncate>
                      {preview}
                    </Text>
                  </td>
                  <td className="w-28 py-1.5 pr-1 align-middle">
                    <Select
                      data={TEXT_SELECT_OPTIONS}
                      value={selections[index]}
                      onChange={(v) =>
                        handleSelectionChange(
                          selections,
                          index,
                          v,
                          onSelectionsChange
                        )
                      }
                      size="xs"
                      allowDeselect={false}
                    />
                  </td>
                  {hasColorAreas && (
                    <td className="w-28 py-1.5 align-middle">
                      <Select
                        data={areaSelectData}
                        value={areaValue}
                        onChange={(v) =>
                          onTextAreaSelectionsChange({
                            ...textAreaSelections,
                            [index]: v ?? NONE_AREA,
                          })
                        }
                        size="xs"
                        allowDeselect={false}
                        leftSection={
                          areaOpt ? (
                            <Group gap={2} wrap="nowrap">
                              <ColorSwatch
                                color={
                                  bgSelections[areaOpt.fieldId] ?? areaOpt.bgHex
                                }
                                size={10}
                                withShadow={false}
                              />
                              {fgSelections[areaOpt.fieldId] && (
                                <ColorSwatch
                                  color={fgSelections[areaOpt.fieldId]}
                                  size={10}
                                  withShadow={false}
                                />
                              )}
                            </Group>
                          ) : null
                        }
                        renderOption={({ option }) => {
                          const opt = colorAreaOptions.find(
                            (o) => o.fieldId === option.value
                          );
                          return (
                            <Group gap="xs" wrap="nowrap">
                              {opt && (
                                <Group gap={2} wrap="nowrap">
                                  <ColorSwatch
                                    color={
                                      bgSelections[opt.fieldId] ?? opt.bgHex
                                    }
                                    size={12}
                                    withShadow={false}
                                  />
                                  {fgSelections[opt.fieldId] && (
                                    <ColorSwatch
                                      color={fgSelections[opt.fieldId]}
                                      size={12}
                                      withShadow={false}
                                    />
                                  )}
                                </Group>
                              )}
                              <span>{option.label}</span>
                            </Group>
                          );
                        }}
                      />
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </ScrollArea.Autosize>
    </Stack>
  );
}

// ── Image step ────────────────────────────────────────────────────

function ImageThumbnail({ href }: { href: string }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="flex size-10 shrink-0 items-center justify-center rounded bg-(--mantine-color-gray-1) dark:bg-(--mantine-color-dark-5)">
        <ImageIcon size={16} className="text-(--mantine-color-dimmed)" />
      </div>
    );
  }

  return (
    <img
      src={href}
      alt=""
      onError={() => setFailed(true)}
      className="size-10 shrink-0 rounded bg-(--mantine-color-gray-1) object-contain dark:bg-(--mantine-color-dark-5)"
    />
  );
}

function ImageStepContent({
  detectedImages,
  selections,
  onSelectionsChange,
}: {
  detectedImages: {
    nodeId: string;
    href: string;
    width: string | undefined;
    height: string | undefined;
  }[];
  selections: Record<number, SelectionValue>;
  onSelectionsChange: (s: Record<number, SelectionValue>) => void;
}) {
  const duplicates = hasDuplicates(selections);

  return (
    <Stack gap="md">
      <Text size="sm" c="dimmed">
        {detectedImages.length} image element
        {detectedImages.length !== 1 ? 's' : ''} found.
      </Text>

      {duplicates && (
        <Alert icon={<AlertTriangle size={16} />} color="red" variant="light">
          Each image field can only be assigned to one element.
        </Alert>
      )}

      <ScrollArea.Autosize mah={300}>
        <table className="w-full border-collapse">
          <tbody>
            {detectedImages.map((detected, index) => (
              <tr key={detected.nodeId}>
                <td className="w-12 py-1.5 pr-2 align-middle">
                  <ImageThumbnail href={detected.href} />
                </td>
                <td className="whitespace-nowrap py-1.5 pr-2 align-middle">
                  {detected.width && detected.height && (
                    <Text size="xs" c="dimmed" lh={1}>
                      {detected.width}&times;{detected.height}
                    </Text>
                  )}
                </td>
                <td className="w-32 py-1.5 align-middle">
                  <Select
                    data={IMAGE_SELECT_OPTIONS}
                    value={selections[index]}
                    onChange={(v) =>
                      handleSelectionChange(
                        selections,
                        index,
                        v,
                        onSelectionsChange
                      )
                    }
                    size="xs"
                    allowDeselect={false}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </ScrollArea.Autosize>
    </Stack>
  );
}

// ── Wizard modal ──────────────────────────────────────────────────

interface DetectionWizardModalProps {
  opened: boolean;
  onClose: () => void;
  nodeMap: Map<string, SvgJsonNode>;
}

export function DetectionWizardModal({
  opened,
  onClose,
  nodeMap,
}: DetectionWizardModalProps) {
  const svgTree = useAnnotatorStore((s) => s.svgTree);
  const assignments = useAnnotatorStore((s) => s.assignments);
  const bulkAssignColors = useAnnotatorStore((s) => s.bulkAssignColors);
  const bulkAssignTexts = useAnnotatorStore((s) => s.bulkAssignTexts);
  const bulkAssignImages = useAnnotatorStore((s) => s.bulkAssignImages);

  const [colorThreshold, setColorThreshold] = useState(30);

  // Compute detected elements (only meaningful when wizard is mounted, i.e. nodeMap.size > 0)
  const colorClusters = useMemo(
    () => extractColorClusters(nodeMap, colorThreshold),
    [nodeMap, colorThreshold]
  );

  const detectedTexts = useMemo(() => extractSvgTexts(nodeMap), [nodeMap]);

  const detectedImages = useMemo(() => extractSvgImages(nodeMap), [nodeMap]);

  const steps = useMemo(() => {
    const result: StepDef[] = [];
    if (colorClusters.length > 0)
      result.push({
        key: 'color',
        label: 'Colors',
        icon: <Palette size={16} />,
      });
    if (detectedTexts.length > 0)
      result.push({
        key: 'text',
        label: 'Text',
        icon: <Type size={16} />,
      });
    if (detectedImages.length > 0)
      result.push({
        key: 'image',
        label: 'Images',
        icon: <ImageIcon size={16} />,
      });
    return result;
  }, [colorClusters.length, detectedTexts.length, detectedImages.length]);

  const [activeStep, setActiveStep] = useState(0);

  // Per-step selections (pre-select from existing assignments when available)
  const [colorSelections, setColorSelections] = useState<
    Record<number, SelectionValue>
  >(() => buildPreselectedColorSelections(colorClusters, assignments));

  const [textSelections, setTextSelections] = useState<
    Record<number, SelectionValue>
  >(() =>
    buildPreselectedNodeSelections(
      detectedTexts,
      assignments,
      'text',
      TEXT_FIELD_IDS
    )
  );

  const [imageSelections, setImageSelections] = useState<
    Record<number, SelectionValue>
  >(() =>
    buildPreselectedNodeSelections(
      detectedImages,
      assignments,
      'image',
      IMAGE_FIELD_IDS
    )
  );

  // ── Foreground sub-step state ──────────────────────────────────
  const [showFgSubStep, setShowFgSubStep] = useState(false);
  const [fgSelections, setFgSelections] = useState<Record<string, string>>({});
  const [bgSelections, setBgSelections] = useState<Record<string, string>>({});
  const [fgColorAreas, setFgColorAreas] = useState<ColorAreaBrief[]>([]);
  const [textAreaSelections, setTextAreaSelections] = useState<
    Record<number, string>
  >({});

  // Render-time sync: reset color selections + fg sub-step when clusters change (threshold drag)
  const [prevColorClusters, setPrevColorClusters] = useState(colorClusters);
  if (colorClusters !== prevColorClusters) {
    setPrevColorClusters(colorClusters);
    setColorSelections(
      buildPreselectedColorSelections(colorClusters, assignments)
    );
    setShowFgSubStep(false);
  }

  // Reset all wizard state when reopened
  const [prevOpened, setPrevOpened] = useState(opened);
  if (opened !== prevOpened) {
    setPrevOpened(opened);
    if (opened) {
      setActiveStep(0);
      setShowFgSubStep(false);
      setFgSelections({});
      setBgSelections({});
      setFgColorAreas([]);
      setTextAreaSelections({});
      setColorSelections(
        buildPreselectedColorSelections(colorClusters, assignments)
      );
      setTextSelections(
        buildPreselectedNodeSelections(
          detectedTexts,
          assignments,
          'text',
          TEXT_FIELD_IDS
        )
      );
      setImageSelections(
        buildPreselectedNodeSelections(
          detectedImages,
          assignments,
          'image',
          IMAGE_FIELD_IDS
        )
      );
    }
  }

  const currentStep = steps[activeStep] as StepDef | undefined;
  const isLastStep = steps.length === 0 || activeStep >= steps.length - 1;

  // Check if current step has a blocking duplicate (text/image are 1:1)
  const currentHasBlockingDuplicate =
    (currentStep?.key === 'text' && hasDuplicates(textSelections)) ||
    (currentStep?.key === 'image' && hasDuplicates(imageSelections));

  const currentHasAssignment =
    (currentStep?.key === 'color' && hasAnyAssignment(colorSelections)) ||
    (currentStep?.key === 'text' && hasAnyAssignment(textSelections)) ||
    (currentStep?.key === 'image' && hasAnyAssignment(imageSelections));

  function applyCurrentStep() {
    if (!currentStep) return;

    if (currentStep.key === 'color') {
      const clusters = colorClusters;
      const grouped = new Map<EditableFieldId, ColorCluster[]>();

      for (let i = 0; i < clusters.length; i++) {
        const selection = colorSelections[i] as SelectionValue | undefined;
        if (!selection || selection === SKIP_VALUE) continue;
        const existing = grouped.get(selection);
        if (existing) {
          existing.push(clusters[i]);
        } else {
          grouped.set(selection, [clusters[i]]);
        }
      }

      const mappings = Array.from(grouped, ([fieldId, fieldClusters]) => {
        if (fieldClusters.length === 1) {
          return { fieldId, members: fieldClusters[0].members };
        }
        const sorted = [...fieldClusters].sort(
          (a, b) => clusterOccurrenceCount(b) - clusterOccurrenceCount(a)
        );
        const baseHex = sorted[0].baseHex;
        const members: ClusterMember[] = fieldClusters.flatMap((c) =>
          c.members.map((m) => ({
            ...m,
            offset: computeOklabOffset(baseHex, m.hex),
          }))
        );
        return { fieldId, members };
      });

      if (mappings.length > 0) bulkAssignColors(mappings);
    }

    if (currentStep.key === 'text') {
      const mappings: { fieldId: EditableFieldId; nodeId: string }[] = [];
      for (let i = 0; i < detectedTexts.length; i++) {
        const selection = textSelections[i];
        if (selection === SKIP_VALUE) continue;
        mappings.push({ fieldId: selection, nodeId: detectedTexts[i].nodeId });
      }
      if (mappings.length > 0) bulkAssignTexts(mappings);
    }

    if (currentStep.key === 'image') {
      const mappings: { fieldId: EditableFieldId; nodeId: string }[] = [];
      for (let i = 0; i < detectedImages.length; i++) {
        const selection = imageSelections[i];
        if (selection === SKIP_VALUE) continue;
        mappings.push({
          fieldId: selection,
          nodeId: detectedImages[i].nodeId,
        });
      }
      if (mappings.length > 0) bulkAssignImages(mappings);
    }
  }

  function buildColorAreaData() {
    const colorAreaMembers = new Map<EditableFieldId, string[]>();
    const bgHexMap = new Map<EditableFieldId, string>();
    const areas: ColorAreaBrief[] = [];

    // Group clusters by selected field
    const grouped = new Map<EditableFieldId, ColorCluster[]>();
    for (let i = 0; i < colorClusters.length; i++) {
      const sel = colorSelections[i] as SelectionValue | undefined;
      if (!sel || sel === SKIP_VALUE) continue;
      const existing = grouped.get(sel);
      if (existing) existing.push(colorClusters[i]);
      else grouped.set(sel, [colorClusters[i]]);
    }

    for (const [fieldId, fieldClusters] of grouped) {
      const nodeIds: string[] = [];
      for (const cluster of fieldClusters) {
        for (const member of cluster.members) {
          for (const occ of member.occurrences) {
            nodeIds.push(occ.nodeId);
          }
        }
      }
      colorAreaMembers.set(fieldId, nodeIds);
      // Use the base hex of the largest cluster as representative color
      const sorted = [...fieldClusters].sort(
        (a, b) => clusterOccurrenceCount(b) - clusterOccurrenceCount(a)
      );
      const bgHex = sorted[0].baseHex;
      bgHexMap.set(fieldId, bgHex);
      areas.push({ fieldId, label: EDITABLE_FIELDS[fieldId].label, bgHex });
    }

    // Sort by vocabulary definition order (Color 1, Color 2, …)
    areas.sort(
      (a, b) =>
        COLOR_FIELD_IDS.indexOf(a.fieldId) - COLOR_FIELD_IDS.indexOf(b.fieldId)
    );

    return { colorAreaMembers, bgHexMap, areas };
  }

  function handleNext() {
    if (!currentStep) return;

    // Color step: first click applies bg, shows fg sub-step; second click advances
    if (currentStep.key === 'color') {
      if (!showFgSubStep) {
        // Apply bg color assignments
        applyCurrentStep();

        // Run fg auto-detection
        const svgEl = querySvgElement();
        const { colorAreaMembers, bgHexMap, areas } = buildColorAreaData();

        if (svgEl && areas.length > 0) {
          const textNodeIds = detectedTexts.map((t) => t.nodeId);
          const result = detectForegroundColors(
            svgEl,
            colorAreaMembers,
            textNodeIds,
            nodeMap,
            bgHexMap
          );

          const fgSel: Record<string, string> = {};
          for (const [fieldId, hex] of result.fgColors) {
            fgSel[fieldId] = hex;
          }
          setFgSelections(fgSel);

          setFgColorAreas(areas);

          // Pre-populate bg selections from cluster base hex
          const bgSel: Record<string, string> = {};
          for (const area of areas) {
            bgSel[area.fieldId] = area.bgHex;
          }
          setBgSelections(bgSel);

          // Pre-populate text area selections from spatial detection
          const areaSel: Record<number, string> = {};
          for (let i = 0; i < detectedTexts.length; i++) {
            let linked: EditableFieldId | undefined;
            for (const [fieldId, textIds] of result.textAreaLinks) {
              if (textIds.includes(detectedTexts[i].nodeId)) {
                linked = fieldId;
                break;
              }
            }
            areaSel[i] = linked ?? NONE_AREA;
          }
          setTextAreaSelections(areaSel);
        }

        setShowFgSubStep(true);
        return;
      }

      // Second click: fg + bg confirmed — persist to store, then advance
      const fgMap = new Map<EditableFieldId, string>();
      for (const [fId, hex] of Object.entries(fgSelections)) {
        fgMap.set(fId as EditableFieldId, hex);
      }
      if (fgMap.size > 0) {
        useAnnotatorStore.getState().bulkSetDefaultPaletteFg(fgMap);
      }
      const bgMap = new Map<EditableFieldId, string>();
      for (const [fId, hex] of Object.entries(bgSelections)) {
        bgMap.set(fId as EditableFieldId, hex);
      }
      if (bgMap.size > 0) {
        useAnnotatorStore.getState().applyBgToColorAreas(bgMap);
      }
      setShowFgSubStep(false);
      if (isLastStep) {
        onClose();
      } else {
        setActiveStep((s) => s + 1);
      }
      return;
    }

    // Text step: apply with user's text area selections + fg
    if (currentStep.key === 'text') {
      const mappings: { fieldId: EditableFieldId; nodeId: string }[] = [];
      for (let i = 0; i < detectedTexts.length; i++) {
        const selection = textSelections[i];
        if (selection === SKIP_VALUE) continue;
        mappings.push({ fieldId: selection, nodeId: detectedTexts[i].nodeId });
      }

      const textColorAreaMap = new Map<string, EditableFieldId>();
      for (let i = 0; i < detectedTexts.length; i++) {
        const areaSel = textAreaSelections[i];
        if (areaSel && areaSel !== NONE_AREA) {
          textColorAreaMap.set(
            detectedTexts[i].nodeId,
            areaSel as EditableFieldId
          );
        }
      }

      const fgColorMap = new Map<EditableFieldId, string>();
      for (const [fieldId, hex] of Object.entries(fgSelections)) {
        fgColorMap.set(fieldId as EditableFieldId, hex);
      }

      if (mappings.length > 0) {
        bulkAssignTexts(
          mappings,
          textColorAreaMap.size > 0 ? textColorAreaMap : undefined,
          fgColorMap.size > 0 ? fgColorMap : undefined
        );
      }

      if (isLastStep) {
        onClose();
      } else {
        setActiveStep((s) => s + 1);
      }
      return;
    }

    // Default: image step or other
    applyCurrentStep();
    if (isLastStep) {
      onClose();
    } else {
      setActiveStep((s) => s + 1);
    }
  }

  function handleSkip() {
    if (showFgSubStep) {
      // Skip fg sub-step, clear pending fg/bg data
      setShowFgSubStep(false);
      setFgSelections({});
      setBgSelections({});
      setTextAreaSelections({});
    }
    if (isLastStep) {
      onClose();
    } else {
      setActiveStep((s) => s + 1);
    }
  }

  function handleBack() {
    if (showFgSubStep) {
      setShowFgSubStep(false);
      return;
    }
    setActiveStep((s) => Math.max(0, s - 1));
  }

  // ── Live preview tree for the modal SVG ────────────────────────
  const previewTree = useMemo(() => {
    if (!svgTree || !showFgSubStep) return null;

    const hasBg = Object.keys(bgSelections).length > 0;
    const hasFg = Object.keys(fgSelections).length > 0;
    if (!hasBg && !hasFg) return null;

    const clone = structuredClone(svgTree);

    // Build a nodeMap for the clone
    const cloneNodes = new Map<string, SvgJsonNode>();
    function walkClone(node: SvgJsonNode) {
      const id = node.attributes?.['__nodeId'];
      if (id) cloneNodes.set(id, node);
      if (node.children) {
        for (const child of node.children) walkClone(child);
      }
    }
    walkClone(clone);

    const currentAssignments = useAnnotatorStore.getState().assignments;

    // Apply bg colors to color field assignments
    for (const a of currentAssignments) {
      if (EDITABLE_FIELDS[a.fieldId].type !== 'color') continue;
      const bg = bgSelections[a.fieldId];
      if (!bg) continue;

      const node = cloneNodes.get(a.nodeId);
      if (!node) continue;

      const target = a.colorTarget ?? 'fill';
      const derived =
        a.colorOffset && !isZeroOffset(a.colorOffset)
          ? applyOklabOffset(bg, a.colorOffset)
          : bg;
      writeColorValue(node, target, derived);
    }

    // Apply fg colors to text fields linked via textColorArea
    for (const a of currentAssignments) {
      if (!a.textColorArea) continue;
      const fg = fgSelections[a.textColorArea];
      if (!fg) continue;

      const node = cloneNodes.get(a.nodeId);
      if (!node) continue;
      writeColorValue(node, 'fill', fg);
    }

    return clone;
  }, [svgTree, showFgSubStep, bgSelections, fgSelections]);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="xs">
          <Wand2 size={18} />
          <Text fw={600}>Auto-Detect Elements</Text>
        </Group>
      }
      size="80rem"
    >
      <div className="flex min-h-[500px] gap-6">
        {/* ── SVG preview ── */}
        {svgTree && (
          <div className="hidden shrink-0 basis-[340px] md:block">
            <div className="sticky top-0 overflow-hidden rounded-md border border-(--mantine-color-dark-4) bg-(--mantine-color-dark-7)">
              <SvgRenderer node={previewTree ?? svgTree} />
            </div>
          </div>
        )}

        {/* ── Wizard content ── */}
        <Stack
          gap="lg"
          justify="space-between"
          style={{ flex: 1, minWidth: 0 }}
        >
          <Stack gap="lg">
            <Stepper
              active={
                showFgSubStep && currentStep?.key === 'color'
                  ? activeStep + 1
                  : activeStep
              }
              allowNextStepsSelect={false}
              size="sm"
            >
              {steps.map((step) => (
                <Stepper.Step
                  key={step.key}
                  label={step.label}
                  icon={step.icon}
                />
              ))}
            </Stepper>

            {currentStep?.key === 'color' &&
              (showFgSubStep ? (
                <FgColorSubStep
                  colorAreas={fgColorAreas}
                  fgSelections={fgSelections}
                  onFgChange={(fieldId, hex) =>
                    setFgSelections((prev) => ({ ...prev, [fieldId]: hex }))
                  }
                  bgSelections={bgSelections}
                  onBgChange={(fieldId, hex) =>
                    setBgSelections((prev) => ({ ...prev, [fieldId]: hex }))
                  }
                />
              ) : (
                <ColorStepContent
                  colorClusters={colorClusters}
                  threshold={colorThreshold}
                  onThresholdChange={setColorThreshold}
                  selections={colorSelections}
                  onSelectionsChange={setColorSelections}
                />
              ))}

            {currentStep?.key === 'text' && (
              <TextStepContent
                detectedTexts={detectedTexts}
                selections={textSelections}
                onSelectionsChange={setTextSelections}
                colorAreaOptions={fgColorAreas}
                textAreaSelections={textAreaSelections}
                onTextAreaSelectionsChange={setTextAreaSelections}
                fgSelections={fgSelections}
                bgSelections={bgSelections}
              />
            )}

            {currentStep?.key === 'image' && (
              <ImageStepContent
                detectedImages={detectedImages}
                selections={imageSelections}
                onSelectionsChange={setImageSelections}
              />
            )}
          </Stack>

          <Group justify="space-between">
            <Button
              variant="subtle"
              leftSection={<ArrowLeft size={16} />}
              onClick={handleBack}
              disabled={activeStep === 0 && !showFgSubStep}
            >
              Back
            </Button>

            <Group gap="xs">
              <Button variant="subtle" onClick={handleSkip}>
                Skip
              </Button>
              <Button
                leftSection={
                  isLastStep ? <Wand2 size={16} /> : <ArrowRight size={16} />
                }
                onClick={handleNext}
                disabled={currentHasBlockingDuplicate}
              >
                {isLastStep
                  ? currentHasAssignment
                    ? 'Apply'
                    : 'Done'
                  : currentHasAssignment
                    ? 'Apply & Continue'
                    : 'Next'}
              </Button>
            </Group>
          </Group>
        </Stack>
      </div>
    </Modal>
  );
}
