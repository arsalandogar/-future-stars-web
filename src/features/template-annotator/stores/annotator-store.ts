import { create } from 'zustand';

import type { SvgJsonNode } from '@/types/svg';
import { isZeroOffset } from '@/utils/color-math';

import { EDITABLE_FIELDS, type EditableFieldId } from '@/features/templates';

import type {
  ClusterMember,
  ColorTarget,
  FieldAssignment,
  NodeMeta,
  ValidationResult,
} from '../types';
import { runValidation } from '../utils/validation-engine';

interface AnnotatorState {
  // SVG data
  svgTree: SvgJsonNode | null;
  rawSvgString: string | null;
  fileName: string | null;

  // Node indices
  nodeIndex: Map<string, NodeMeta>;
  nodeMap: Map<string, SvgJsonNode>;

  // Selection
  selectedNodeId: string | null;
  hoveredNodeId: string | null;

  // Tree state
  expandedNodeIds: Set<string>;

  // Assignments
  assignments: FieldAssignment[];

  // Validation
  validationResults: ValidationResult[];

  // Undo/redo
  undoStack: FieldAssignment[][];
  redoStack: FieldAssignment[][];

  // Actions
  loadSvg: (
    tree: SvgJsonNode,
    rawSvg: string,
    fileName: string,
    nodeIndex: Map<string, NodeMeta>,
    nodeMap: Map<string, SvgJsonNode>
  ) => void;
  reset: () => void;
  selectNode: (nodeId: string | null) => void;
  hoverNode: (nodeId: string | null) => void;
  toggleExpanded: (nodeId: string) => void;
  expandToNode: (nodeId: string) => void;
  assignField: (
    nodeId: string,
    fieldId: EditableFieldId,
    colorTarget?: ColorTarget
  ) => void;
  removeAssignment: (nodeId: string, fieldId: EditableFieldId) => void;
  setMaxWidth: (
    nodeId: string,
    fieldId: EditableFieldId,
    maxWidth: number
  ) => void;
  bulkAssignColors: (
    mappings: { fieldId: EditableFieldId; members: ClusterMember[] }[]
  ) => void;
  validate: () => void;
  undo: () => void;
  redo: () => void;
}

function getAncestorIds(
  nodeId: string,
  nodeIndex: Map<string, NodeMeta>
): string[] {
  const ids: string[] = [];
  let current = nodeIndex.get(nodeId);
  while (current?.parentNodeId) {
    ids.push(current.parentNodeId);
    current = nodeIndex.get(current.parentNodeId);
  }
  return ids;
}

const MAX_UNDO = 50;

const initialState = {
  svgTree: null as SvgJsonNode | null,
  rawSvgString: null as string | null,
  fileName: null as string | null,
  nodeIndex: new Map<string, NodeMeta>(),
  nodeMap: new Map<string, SvgJsonNode>(),
  selectedNodeId: null as string | null,
  hoveredNodeId: null as string | null,
  expandedNodeIds: new Set<string>(),
  assignments: [] as FieldAssignment[],
  validationResults: [] as ValidationResult[],
  undoStack: [] as FieldAssignment[][],
  redoStack: [] as FieldAssignment[][],
};

export const useAnnotatorStore = create<AnnotatorState>()((set, get) => ({
  ...initialState,

  loadSvg: (tree, rawSvg, fileName, nodeIndex, nodeMap) => {
    // Auto-expand the root element
    const rootId = tree.attributes['__nodeId'];
    const expanded = new Set<string>();
    if (rootId) expanded.add(rootId);

    set({
      svgTree: tree,
      rawSvgString: rawSvg,
      fileName,
      nodeIndex,
      nodeMap,
      selectedNodeId: null,
      hoveredNodeId: null,
      expandedNodeIds: expanded,
      assignments: [],
      validationResults: [],
      undoStack: [],
      redoStack: [],
    });
  },

  reset: () => set(initialState),

  selectNode: (nodeId) => {
    if (nodeId) {
      const { nodeIndex, expandedNodeIds } = get();
      const ancestors = getAncestorIds(nodeId, nodeIndex);
      const newExpanded = new Set(expandedNodeIds);
      for (const id of ancestors) newExpanded.add(id);
      set({ selectedNodeId: nodeId, expandedNodeIds: newExpanded });
    } else {
      set({ selectedNodeId: nodeId });
    }
  },

  hoverNode: (nodeId) => set({ hoveredNodeId: nodeId }),

  toggleExpanded: (nodeId) => {
    const { expandedNodeIds } = get();
    const newSet = new Set(expandedNodeIds);
    if (newSet.has(nodeId)) newSet.delete(nodeId);
    else newSet.add(nodeId);
    set({ expandedNodeIds: newSet });
  },

  expandToNode: (nodeId) => {
    const { nodeIndex, expandedNodeIds } = get();
    const ancestors = getAncestorIds(nodeId, nodeIndex);
    const newExpanded = new Set(expandedNodeIds);
    for (const id of ancestors) newExpanded.add(id);
    set({ expandedNodeIds: newExpanded });
  },

  assignField: (nodeId, fieldId, colorTarget) => {
    const { assignments, undoStack } = get();
    const field = EDITABLE_FIELDS[fieldId];
    let filtered = assignments;
    if (field.type === 'color') {
      // One color per node, but same color can appear on multiple nodes
      filtered = assignments.filter(
        (a) =>
          !(a.nodeId === nodeId && EDITABLE_FIELDS[a.fieldId].type === 'color')
      );
    } else {
      // For text/image: one node per field AND one field per node per type
      filtered = assignments.filter(
        (a) =>
          a.fieldId !== fieldId &&
          !(
            a.nodeId === nodeId &&
            EDITABLE_FIELDS[a.fieldId].type === field.type
          )
      );
    }

    const newAssignment: FieldAssignment = { nodeId, fieldId, colorTarget };
    const newAssignments = [...filtered, newAssignment];

    set({
      assignments: newAssignments,
      undoStack: [...undoStack.slice(-(MAX_UNDO - 1)), assignments],
      redoStack: [],
    });
  },

  removeAssignment: (nodeId, fieldId) => {
    const { assignments, undoStack } = get();
    const newAssignments = assignments.filter(
      (a) => !(a.nodeId === nodeId && a.fieldId === fieldId)
    );
    set({
      assignments: newAssignments,
      undoStack: [...undoStack.slice(-(MAX_UNDO - 1)), assignments],
      redoStack: [],
    });
  },

  setMaxWidth: (nodeId, fieldId, maxWidth) => {
    const { assignments } = get();
    const newAssignments = assignments.map((a) =>
      a.nodeId === nodeId && a.fieldId === fieldId ? { ...a, maxWidth } : a
    );
    set({ assignments: newAssignments });
  },

  bulkAssignColors: (mappings) => {
    const { assignments, undoStack } = get();

    const affectedNodeIds = new Set<string>();
    const newAssignments: FieldAssignment[] = [];

    for (const mapping of mappings) {
      for (const member of mapping.members) {
        for (const occ of member.occurrences) {
          affectedNodeIds.add(occ.nodeId);
          newAssignments.push({
            nodeId: occ.nodeId,
            fieldId: mapping.fieldId,
            colorTarget: occ.colorTarget,
            ...(!isZeroOffset(member.offset) && {
              colorOffset: member.offset,
            }),
          });
        }
      }
    }

    // Remove existing color assignments on affected nodes, then append new ones
    const preserved = assignments.filter(
      (a) =>
        !(
          affectedNodeIds.has(a.nodeId) &&
          EDITABLE_FIELDS[a.fieldId].type === 'color'
        )
    );

    set({
      assignments: [...preserved, ...newAssignments],
      undoStack: [...undoStack.slice(-(MAX_UNDO - 1)), assignments],
      redoStack: [],
    });
  },

  validate: () => {
    const { assignments, nodeIndex } = get();
    if (assignments.length === 0 && nodeIndex.size === 0) return;
    const results = runValidation(assignments, nodeIndex);
    set({ validationResults: results });
  },

  undo: () => {
    const { undoStack, assignments, redoStack } = get();
    if (undoStack.length === 0) return;
    const previous = undoStack[undoStack.length - 1];
    set({
      assignments: previous,
      undoStack: undoStack.slice(0, -1),
      redoStack: [...redoStack, assignments],
    });
  },

  redo: () => {
    const { redoStack, assignments, undoStack } = get();
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    set({
      assignments: next,
      redoStack: redoStack.slice(0, -1),
      undoStack: [...undoStack, assignments],
    });
  },
}));
