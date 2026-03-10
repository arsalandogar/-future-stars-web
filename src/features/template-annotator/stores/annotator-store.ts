import { create } from 'zustand';

import type { SvgJsonNode } from '@/types/svg';
import { isZeroOffset } from '@/utils/color-math';

import { EDITABLE_FIELDS, type EditableFieldId } from '@/features/templates';

import type {
  ClusterMember,
  ColorTarget,
  FieldAssignment,
  NodeMeta,
  TextAlign,
  TouchBounds,
} from '../types';
import { ALIGN_TO_TEXT_ANCHOR } from '../types';
import { measureTextBounds } from '../utils/measure-text-bounds';
import {
  buildNodeIndex,
  collectDescendantNodeIds,
} from '../utils/svg-node-helpers';
import {
  applyRotateAroundPoint,
  applyTranslate,
  removeScaleFromTransform,
} from '../utils/svg-transform-helpers';

type UndoEntry =
  | { type: 'assignments'; assignments: FieldAssignment[] }
  | { type: 'transform'; nodeId: string; prevValue: string | undefined }
  | {
      type: 'deleteNode';
      parentNodeId: string;
      childIndex: number;
      node: SvgJsonNode;
      prevAssignments: FieldAssignment[];
    }
  | {
      type: 'textAreaResize';
      nodeId: string;
      prevAssignments: FieldAssignment[];
      prevTransform: string | undefined;
    }
  | {
      type: 'textAlignChange';
      nodeId: string;
      prevAssignments: FieldAssignment[];
      prevSnapshot: TextAlignSnapshot;
    }
  | {
      type: 'fontSizeChange';
      nodeId: string;
      prevStyle: string | undefined;
      prevFontSize: string | undefined;
    };

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

  // Touch bounds editing
  editingTouchBoundsNodeId: string | null;

  // Transform editing
  editingTransformNodeId: string | null;

  // Tree state
  expandedNodeIds: Set<string>;

  // Assignments
  assignments: FieldAssignment[];

  // Undo/redo
  undoStack: UndoEntry[];
  redoStack: UndoEntry[];

  // Actions
  loadSvg: (opts: {
    tree: SvgJsonNode;
    nodeIndex: Map<string, NodeMeta>;
    nodeMap: Map<string, SvgJsonNode>;
    rawSvgString?: string;
    fileName?: string;
    assignments?: FieldAssignment[];
  }) => void;
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
  setTextDimensions: (
    nodeId: string,
    fieldId: EditableFieldId,
    maxWidth: number,
    maxHeight: number
  ) => void;
  commitTextAreaResize: (
    nodeId: string,
    fieldId: EditableFieldId,
    maxWidth: number,
    maxHeight: number,
    translateDx: number,
    translateDy: number
  ) => void;
  removeNodeScale: (nodeId: string) => void;
  bulkAssignColors: (
    mappings: { fieldId: EditableFieldId; members: ClusterMember[] }[]
  ) => void;
  bulkAssignTexts: (
    mappings: { fieldId: EditableFieldId; nodeId: string }[]
  ) => void;
  bulkAssignImages: (
    mappings: { fieldId: EditableFieldId; nodeId: string }[]
  ) => void;
  setEditingTouchBounds: (nodeId: string | null) => void;
  setEditingTransform: (nodeId: string | null) => void;
  rotateNode: (
    nodeId: string,
    angleDeg: number,
    center: { x: number; y: number }
  ) => void;
  commitNodeTransform: (nodeId: string, newTransform: string) => void;
  resetNodeTransform: (nodeId: string) => void;
  commitTouchBounds: (
    nodeId: string,
    fieldId: EditableFieldId,
    bounds: TouchBounds
  ) => void;
  removeTouchBounds: (nodeId: string, fieldId: EditableFieldId) => void;
  setTextAlign: (
    nodeId: string,
    fieldId: EditableFieldId,
    align: TextAlign
  ) => void;
  setTextMultiline: (
    nodeId: string,
    fieldId: EditableFieldId,
    multiline: boolean
  ) => void;
  setFontSize: (nodeId: string, fontSize: number) => void;
  deleteNode: (nodeId: string) => void;
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

function pushUndo(undoStack: UndoEntry[], entry: UndoEntry): UndoEntry[] {
  return [...undoStack.slice(-(MAX_UNDO - 1)), entry];
}

function asElementNode(
  node: SvgJsonNode
): (SvgJsonNode & { type: 'element' }) | null {
  return node.type === 'element'
    ? (node as SvgJsonNode & { type: 'element' })
    : null;
}

function swapNodeTransform(
  nodeMap: Map<string, SvgJsonNode>,
  nodeId: string,
  newTransform: string | undefined
): string | undefined | null {
  const node = nodeMap.get(nodeId);
  if (!node || node.type !== 'element') return null;
  const current = node.attributes.transform;
  if (newTransform) {
    node.attributes.transform = newTransform;
  } else {
    delete node.attributes.transform;
  }
  return current;
}

function applyTransformEntry(
  entry: UndoEntry & { type: 'transform' },
  nodeMap: Map<string, SvgJsonNode>,
  svgTree: SvgJsonNode
): { currentValue: string | undefined; svgTree: SvgJsonNode } | null {
  const currentValue = swapNodeTransform(
    nodeMap,
    entry.nodeId,
    entry.prevValue
  );
  if (currentValue === null) return null;
  return { currentValue, svgTree: { ...svgTree } };
}

interface TextAlignSnapshot {
  textAnchor: string | undefined;
  x: string | undefined;
  tspanXValues: { index: number; x: string }[];
}

function snapshotTextAlign(
  node: SvgJsonNode & { type: 'element' }
): TextAlignSnapshot {
  const tspanXValues: { index: number; x: string }[] = [];
  node.children.forEach((child, index) => {
    if (
      child.type === 'element' &&
      child.name === 'tspan' &&
      child.attributes.x != null
    ) {
      tspanXValues.push({ index, x: child.attributes.x });
    }
  });
  // Inline style text-anchor takes CSS precedence over the SVG attribute
  const styleAnchorMatch = node.attributes.style?.match(
    /text-anchor\s*:\s*(\w+)/
  );
  const effectiveTextAnchor =
    styleAnchorMatch?.[1] ?? node.attributes['text-anchor'];

  return {
    textAnchor: effectiveTextAnchor,
    x: node.attributes.x,
    tspanXValues,
  };
}

function restoreTextAlign(
  node: SvgJsonNode & { type: 'element' },
  snapshot: TextAlignSnapshot
): void {
  if (snapshot.textAnchor != null) {
    node.attributes['text-anchor'] = snapshot.textAnchor;
  } else {
    delete node.attributes['text-anchor'];
  }
  if (snapshot.x != null) {
    node.attributes.x = snapshot.x;
  } else {
    delete node.attributes.x;
  }
  for (const { index, x } of snapshot.tspanXValues) {
    const child = node.children[index];
    if (child?.type === 'element' && child.name === 'tspan') {
      child.attributes.x = x;
    }
  }
}

function swapFontSize(
  nodeMap: Map<string, SvgJsonNode>,
  nodeId: string,
  prevStyle: string | undefined,
  prevFontSize: string | undefined
): {
  currentStyle: string | undefined;
  currentFontSize: string | undefined;
} | null {
  const node = nodeMap.get(nodeId);
  if (!node || node.type !== 'element') return null;

  const currentFontSize = node.attributes['font-size'];
  const currentStyle = node.attributes.style;

  if (prevFontSize != null) {
    node.attributes['font-size'] = prevFontSize;
  } else {
    delete node.attributes['font-size'];
  }
  if (prevStyle != null) {
    node.attributes.style = prevStyle;
  } else {
    delete node.attributes.style;
  }

  return { currentStyle, currentFontSize };
}

function updateAssignmentDimensions(
  assignments: FieldAssignment[],
  nodeId: string,
  fieldId: EditableFieldId,
  maxWidth: number,
  maxHeight: number
): FieldAssignment[] {
  return assignments.map((a) =>
    a.nodeId === nodeId && a.fieldId === fieldId
      ? { ...a, maxWidth, maxHeight }
      : a
  );
}

function updateAssignmentMultiline(
  assignments: FieldAssignment[],
  nodeId: string,
  fieldId: EditableFieldId,
  multiline: boolean
): FieldAssignment[] {
  return assignments.map((a) => {
    if (a.nodeId !== nodeId || a.fieldId !== fieldId) return a;
    if (multiline) return { ...a, multiline: true };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { multiline: _omit, ...rest } = a;
    return rest;
  });
}

function clearIfDeleted(
  value: string | null,
  deletedIds: Set<string>
): string | null {
  return value && deletedIds.has(value) ? null : value;
}

function applyNodeDeletion(
  entry: { parentNodeId: string; node: SvgJsonNode },
  state: {
    svgTree: SvgJsonNode;
    nodeIndex: Map<string, NodeMeta>;
    nodeMap: Map<string, SvgJsonNode>;
    expandedNodeIds: Set<string>;
    assignments: FieldAssignment[];
    selectedNodeId: string | null;
    hoveredNodeId: string | null;
    editingTouchBoundsNodeId: string | null;
    editingTransformNodeId: string | null;
  }
) {
  const descendantIds = collectDescendantNodeIds(entry.node);

  const newNodeIndex = new Map(state.nodeIndex);
  const newNodeMap = new Map(state.nodeMap);
  const newExpanded = new Set(state.expandedNodeIds);
  for (const id of descendantIds) {
    newNodeIndex.delete(id);
    newNodeMap.delete(id);
    newExpanded.delete(id);
  }

  return {
    svgTree: { ...state.svgTree },
    nodeIndex: newNodeIndex,
    nodeMap: newNodeMap,
    expandedNodeIds: newExpanded,
    assignments: state.assignments.filter((a) => !descendantIds.has(a.nodeId)),
    selectedNodeId: clearIfDeleted(state.selectedNodeId, descendantIds),
    hoveredNodeId: clearIfDeleted(state.hoveredNodeId, descendantIds),
    editingTouchBoundsNodeId: clearIfDeleted(
      state.editingTouchBoundsNodeId,
      descendantIds
    ),
    editingTransformNodeId: clearIfDeleted(
      state.editingTransformNodeId,
      descendantIds
    ),
  };
}

function bulkAssignByType(
  assignments: FieldAssignment[],
  undoStack: UndoEntry[],
  type: 'text' | 'image',
  mappings: { fieldId: EditableFieldId; nodeId: string }[],
  buildAssignment: (m: {
    fieldId: EditableFieldId;
    nodeId: string;
  }) => FieldAssignment
) {
  const affectedNodeIds = new Set(mappings.map((m) => m.nodeId));
  const affectedFieldIds = new Set(mappings.map((m) => m.fieldId));

  const preserved = assignments.filter(
    (a) =>
      !(
        affectedNodeIds.has(a.nodeId) &&
        EDITABLE_FIELDS[a.fieldId].type === type
      ) && !affectedFieldIds.has(a.fieldId)
  );

  return {
    assignments: [...preserved, ...mappings.map(buildAssignment)],
    undoStack: pushUndo(undoStack, { type: 'assignments', assignments }),
    redoStack: [] as UndoEntry[],
  };
}

const initialState = {
  svgTree: null as SvgJsonNode | null,
  rawSvgString: null as string | null,
  fileName: null as string | null,
  nodeIndex: new Map<string, NodeMeta>(),
  nodeMap: new Map<string, SvgJsonNode>(),
  selectedNodeId: null as string | null,
  hoveredNodeId: null as string | null,
  editingTouchBoundsNodeId: null as string | null,
  editingTransformNodeId: null as string | null,
  expandedNodeIds: new Set<string>(),
  assignments: [] as FieldAssignment[],
  undoStack: [] as UndoEntry[],
  redoStack: [] as UndoEntry[],
};

export const useAnnotatorStore = create<AnnotatorState>()((set, get) => ({
  ...initialState,

  loadSvg: (opts) => {
    // Auto-expand the root element
    const rootId = opts.tree.attributes['__nodeId'];
    const expanded = new Set<string>();
    if (rootId) expanded.add(rootId);

    set({
      svgTree: opts.tree,
      rawSvgString: opts.rawSvgString ?? null,
      fileName: opts.fileName ?? null,
      nodeIndex: opts.nodeIndex,
      nodeMap: opts.nodeMap,
      selectedNodeId: null,
      hoveredNodeId: null,
      expandedNodeIds: expanded,
      assignments: opts.assignments ?? [],
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
      set({
        selectedNodeId: nodeId,
        expandedNodeIds: newExpanded,
        editingTouchBoundsNodeId: null,
        editingTransformNodeId: null,
      });
    } else {
      set({
        selectedNodeId: nodeId,
        editingTouchBoundsNodeId: null,
        editingTransformNodeId: null,
      });
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
      undoStack: pushUndo(undoStack, { type: 'assignments', assignments }),
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
      undoStack: pushUndo(undoStack, { type: 'assignments', assignments }),
      redoStack: [],
    });
  },

  setTextDimensions: (nodeId, fieldId, maxWidth, maxHeight) => {
    const { assignments, undoStack } = get();
    set({
      assignments: updateAssignmentDimensions(
        assignments,
        nodeId,
        fieldId,
        maxWidth,
        maxHeight
      ),
      undoStack: pushUndo(undoStack, { type: 'assignments', assignments }),
      redoStack: [],
    });
  },

  commitTextAreaResize: (
    nodeId,
    fieldId,
    maxWidth,
    maxHeight,
    translateDx,
    translateDy
  ) => {
    const { assignments, undoStack, svgTree, nodeMap } = get();
    if (!svgTree) return;
    const node = nodeMap.get(nodeId);
    if (!node || node.type !== 'element') return;

    const prevAssignments = assignments;
    const prevTransform = node.attributes.transform;
    const newAssignments = updateAssignmentDimensions(
      assignments,
      nodeId,
      fieldId,
      maxWidth,
      maxHeight
    );

    // Apply translate if north/west handle moved the origin
    if (translateDx !== 0 || translateDy !== 0) {
      const newTransform = applyTranslate(
        node.attributes.transform,
        translateDx,
        translateDy
      );
      node.attributes.transform = newTransform;
    }

    set({
      assignments: newAssignments,
      svgTree: { ...svgTree },
      undoStack: pushUndo(undoStack, {
        type: 'textAreaResize',
        nodeId,
        prevAssignments,
        prevTransform,
      }),
      redoStack: [],
    });
  },

  removeNodeScale: (nodeId) => {
    const { svgTree, nodeMap, undoStack } = get();
    if (!svgTree) return;
    const node = nodeMap.get(nodeId);
    if (!node || node.type !== 'element') return;

    const prevValue = node.attributes.transform;
    const newTransform = removeScaleFromTransform(prevValue);

    if (newTransform === prevValue) return;

    if (newTransform) {
      node.attributes.transform = newTransform;
    } else {
      delete node.attributes.transform;
    }

    set({
      svgTree: { ...svgTree },
      undoStack: pushUndo(undoStack, { type: 'transform', nodeId, prevValue }),
      redoStack: [],
    });
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
      undoStack: pushUndo(undoStack, { type: 'assignments', assignments }),
      redoStack: [],
    });
  },

  bulkAssignTexts: (mappings) => {
    const { assignments, undoStack, nodeMap, svgTree } = get();
    set(
      bulkAssignByType(assignments, undoStack, 'text', mappings, (m) => {
        const assignment: FieldAssignment = {
          nodeId: m.nodeId,
          fieldId: m.fieldId,
        };
        if (svgTree) {
          const textNode = nodeMap.get(m.nodeId);
          if (textNode) {
            const bounds = measureTextBounds(textNode, svgTree);
            if (bounds) {
              assignment.maxWidth = bounds.width;
              assignment.maxHeight = bounds.height;
            }
          }
        }
        return assignment;
      })
    );
  },

  bulkAssignImages: (mappings) => {
    const { assignments, undoStack } = get();
    set(
      bulkAssignByType(assignments, undoStack, 'image', mappings, (m) => ({
        nodeId: m.nodeId,
        fieldId: m.fieldId,
      }))
    );
  },

  setEditingTouchBounds: (nodeId) =>
    set({
      editingTouchBoundsNodeId: nodeId,
      ...(nodeId && { editingTransformNodeId: null }),
    }),

  setEditingTransform: (nodeId) =>
    set({
      editingTransformNodeId: nodeId,
      ...(nodeId && { editingTouchBoundsNodeId: null }),
    }),

  rotateNode: (nodeId, angleDeg, center) => {
    const { svgTree, nodeMap, undoStack } = get();
    if (!svgTree || angleDeg === 0) return;
    const node = nodeMap.get(nodeId);
    if (!node || node.type !== 'element') return;

    const prevValue = node.attributes.transform;
    node.attributes.transform = applyRotateAroundPoint(
      prevValue,
      angleDeg,
      center.x,
      center.y
    );

    set({
      svgTree: { ...svgTree },
      undoStack: pushUndo(undoStack, { type: 'transform', nodeId, prevValue }),
      redoStack: [],
    });
  },

  commitNodeTransform: (nodeId, newTransform) => {
    const { svgTree, nodeMap, undoStack } = get();
    if (!svgTree) return;
    const node = nodeMap.get(nodeId);
    if (!node || node.type !== 'element') return;

    const prevValue = node.attributes.transform;
    node.attributes.transform = newTransform;

    set({
      svgTree: { ...svgTree },
      undoStack: pushUndo(undoStack, { type: 'transform', nodeId, prevValue }),
      redoStack: [],
    });
  },

  resetNodeTransform: (nodeId) => {
    const { svgTree, nodeMap, undoStack } = get();
    if (!svgTree) return;
    const node = nodeMap.get(nodeId);
    if (!node || node.type !== 'element') return;

    const prevValue = node.attributes.transform;
    if (!prevValue) return;
    delete node.attributes.transform;

    set({
      svgTree: { ...svgTree },
      undoStack: pushUndo(undoStack, { type: 'transform', nodeId, prevValue }),
      redoStack: [],
    });
  },

  commitTouchBounds: (nodeId, fieldId, bounds) => {
    const { assignments, undoStack } = get();
    const newAssignments = assignments.map((a) =>
      a.nodeId === nodeId && a.fieldId === fieldId
        ? { ...a, touchBounds: bounds }
        : a
    );
    set({
      assignments: newAssignments,
      undoStack: pushUndo(undoStack, { type: 'assignments', assignments }),
      redoStack: [],
    });
  },

  removeTouchBounds: (nodeId, fieldId) => {
    const { assignments, undoStack } = get();
    const newAssignments = assignments.map((a) => {
      if (a.nodeId !== nodeId || a.fieldId !== fieldId) return a;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { touchBounds: _omit, ...rest } = a;
      return rest;
    });
    set({
      assignments: newAssignments,
      undoStack: pushUndo(undoStack, { type: 'assignments', assignments }),
      redoStack: [],
    });
  },

  setTextAlign: (nodeId, fieldId, align) => {
    const { assignments, undoStack, svgTree, nodeMap } = get();
    if (!svgTree) return;
    const rawNode = nodeMap.get(nodeId);
    if (!rawNode) return;
    const node = asElementNode(rawNode);
    if (!node) return;

    const prevSnapshot = snapshotTextAlign(node);
    const prevAssignments = assignments;

    // Calculate new x position when local maxWidth is available.
    const assignment = assignments.find(
      (a) => a.nodeId === nodeId && a.fieldId === fieldId
    );
    const maxWidth = assignment?.maxWidth;

    if (maxWidth != null) {
      const originalAnchor = prevSnapshot.textAnchor ?? 'start';
      const originalX = Number(prevSnapshot.x ?? 0);

      // Calculate left edge from current anchor position
      let leftEdge: number;
      if (originalAnchor === 'middle') {
        leftEdge = originalX - maxWidth / 2;
      } else if (originalAnchor === 'end') {
        leftEdge = originalX - maxWidth;
      } else {
        leftEdge = originalX;
      }

      // Calculate new x from left edge based on desired alignment
      let newX: number;
      if (align === 'center') {
        newX = leftEdge + maxWidth / 2;
      } else if (align === 'right') {
        newX = leftEdge + maxWidth;
      } else {
        newX = leftEdge;
      }

      const newXStr = String(newX);
      const originalXStr = prevSnapshot.x ?? String(originalX);

      // Update x on the text element and matching tspan children
      node.attributes.x = newXStr;
      for (const child of node.children) {
        if (
          child.type === 'element' &&
          child.name === 'tspan' &&
          child.attributes.x === originalXStr
        ) {
          child.attributes.x = newXStr;
        }
      }
    }

    // Remove text-anchor from inline style so SVG attribute takes effect
    if (node.attributes.style) {
      const cleaned = node.attributes.style
        .replace(/text-anchor\s*:\s*[^;]+;?\s*/g, '')
        .trim();
      if (cleaned) {
        node.attributes.style = cleaned;
      } else {
        delete node.attributes.style;
      }
    }

    // Always set text-anchor
    node.attributes['text-anchor'] = ALIGN_TO_TEXT_ANCHOR[align];

    // Update assignment
    const newAssignments = assignments.map((a) =>
      a.nodeId === nodeId && a.fieldId === fieldId
        ? { ...a, textAlign: align }
        : a
    );

    set({
      svgTree: { ...svgTree },
      assignments: newAssignments,
      undoStack: pushUndo(undoStack, {
        type: 'textAlignChange',
        nodeId,
        prevAssignments,
        prevSnapshot,
      }),
      redoStack: [],
    });
  },

  setTextMultiline: (nodeId, fieldId, multiline) => {
    const { assignments, undoStack } = get();
    set({
      assignments: updateAssignmentMultiline(
        assignments,
        nodeId,
        fieldId,
        multiline
      ),
      undoStack: pushUndo(undoStack, { type: 'assignments', assignments }),
      redoStack: [],
    });
  },

  setFontSize: (nodeId, fontSize) => {
    const { svgTree, nodeMap, undoStack } = get();
    if (!svgTree) return;
    const node = nodeMap.get(nodeId);
    if (!node || node.type !== 'element') return;

    const prevFontSize = node.attributes['font-size'];
    const prevStyle = node.attributes.style;

    // If font-size lives in the style attribute, replace it there
    if (prevStyle && /font-size\s*:/.test(prevStyle)) {
      node.attributes.style = prevStyle.replace(
        /font-size\s*:\s*[\d.]+\s*(px|em|rem|pt|%)?/,
        `font-size: ${fontSize}px`
      );
    } else {
      node.attributes['font-size'] = String(fontSize);
    }

    set({
      svgTree: { ...svgTree },
      undoStack: pushUndo(undoStack, {
        type: 'fontSizeChange',
        nodeId,
        prevStyle,
        prevFontSize,
      }),
      redoStack: [],
    });
  },

  deleteNode: (nodeId) => {
    const { svgTree, ...rest } = get();
    if (!svgTree) return;

    const meta = rest.nodeIndex.get(nodeId);
    if (!meta || meta.parentNodeId === null) return;

    const parentNode = rest.nodeMap.get(meta.parentNodeId);
    if (!parentNode || parentNode.type !== 'element') return;

    const childIndex = parentNode.children.findIndex(
      (c) => c.type === 'element' && c.attributes['__nodeId'] === nodeId
    );
    if (childIndex === -1) return;

    const node = parentNode.children[childIndex];
    parentNode.children.splice(childIndex, 1);

    set({
      ...applyNodeDeletion(
        { parentNodeId: meta.parentNodeId, node },
        { svgTree, ...rest }
      ),
      undoStack: pushUndo(rest.undoStack, {
        type: 'deleteNode',
        parentNodeId: meta.parentNodeId,
        childIndex,
        node,
        prevAssignments: rest.assignments,
      }),
      redoStack: [],
    });
  },

  undo: () => {
    const { undoStack, assignments, redoStack, svgTree, nodeMap, nodeIndex } =
      get();
    if (undoStack.length === 0) return;
    const entry = undoStack[undoStack.length - 1];
    const newUndoStack = undoStack.slice(0, -1);

    if (entry.type === 'assignments') {
      set({
        assignments: entry.assignments,
        undoStack: newUndoStack,
        redoStack: [...redoStack, { type: 'assignments', assignments }],
      });
    } else if (entry.type === 'transform') {
      if (!svgTree) return;
      const result = applyTransformEntry(entry, nodeMap, svgTree);
      if (!result) return;
      set({
        svgTree: result.svgTree,
        undoStack: newUndoStack,
        redoStack: [
          ...redoStack,
          {
            type: 'transform',
            nodeId: entry.nodeId,
            prevValue: result.currentValue,
          },
        ],
      });
    } else if (entry.type === 'textAreaResize') {
      if (!svgTree) return;
      const currentTransform = swapNodeTransform(
        nodeMap,
        entry.nodeId,
        entry.prevTransform
      );
      if (currentTransform === null) return;

      set({
        svgTree: { ...svgTree },
        assignments: entry.prevAssignments,
        undoStack: newUndoStack,
        redoStack: [
          ...redoStack,
          {
            type: 'textAreaResize',
            nodeId: entry.nodeId,
            prevAssignments: assignments,
            prevTransform: currentTransform,
          },
        ],
      });
    } else if (entry.type === 'textAlignChange') {
      if (!svgTree) return;
      const rawNode = nodeMap.get(entry.nodeId);
      if (!rawNode) return;
      const node = asElementNode(rawNode);
      if (!node) return;

      const currentSnapshot = snapshotTextAlign(node);
      restoreTextAlign(node, entry.prevSnapshot);

      set({
        svgTree: { ...svgTree },
        assignments: entry.prevAssignments,
        undoStack: newUndoStack,
        redoStack: [
          ...redoStack,
          {
            type: 'textAlignChange',
            nodeId: entry.nodeId,
            prevAssignments: assignments,
            prevSnapshot: currentSnapshot,
          },
        ],
      });
    } else if (entry.type === 'fontSizeChange') {
      if (!svgTree) return;
      const result = swapFontSize(
        nodeMap,
        entry.nodeId,
        entry.prevStyle,
        entry.prevFontSize
      );
      if (!result) return;
      set({
        svgTree: { ...svgTree },
        undoStack: newUndoStack,
        redoStack: [
          ...redoStack,
          {
            type: 'fontSizeChange',
            nodeId: entry.nodeId,
            prevStyle: result.currentStyle,
            prevFontSize: result.currentFontSize,
          },
        ],
      });
    } else if (entry.type === 'deleteNode') {
      if (!svgTree) return;
      const parentNode = nodeMap.get(entry.parentNodeId);
      if (!parentNode || parentNode.type !== 'element') return;

      // Re-insert the node
      parentNode.children.splice(entry.childIndex, 0, entry.node);

      // Rebuild index for the restored subtree
      const parentMeta = nodeIndex.get(entry.parentNodeId);
      const parentDepth = parentMeta?.depth ?? 0;
      const restored = buildNodeIndex(entry.node);
      const newNodeIndex = new Map(nodeIndex);
      const newNodeMap = new Map(nodeMap);
      for (const [id, restoredMeta] of restored.nodeIndex) {
        newNodeIndex.set(id, {
          ...restoredMeta,
          parentNodeId: restoredMeta.parentNodeId ?? entry.parentNodeId,
          depth: restoredMeta.depth + parentDepth + 1,
        });
        newNodeMap.set(id, restored.nodeMap.get(id)!);
      }

      set({
        svgTree: { ...svgTree },
        nodeIndex: newNodeIndex,
        nodeMap: newNodeMap,
        assignments: entry.prevAssignments,
        undoStack: newUndoStack,
        redoStack: [
          ...redoStack,
          {
            type: 'deleteNode',
            parentNodeId: entry.parentNodeId,
            childIndex: entry.childIndex,
            node: entry.node,
            prevAssignments: assignments,
          },
        ],
      });
    }
  },

  redo: () => {
    const { svgTree, ...rest } = get();
    const { redoStack, assignments, undoStack, nodeMap } = rest;
    if (redoStack.length === 0) return;
    const entry = redoStack[redoStack.length - 1];
    const newRedoStack = redoStack.slice(0, -1);

    if (entry.type === 'assignments') {
      set({
        assignments: entry.assignments,
        redoStack: newRedoStack,
        undoStack: [...undoStack, { type: 'assignments', assignments }],
      });
    } else if (entry.type === 'transform') {
      if (!svgTree) return;
      const result = applyTransformEntry(entry, nodeMap, svgTree);
      if (!result) return;
      set({
        svgTree: result.svgTree,
        redoStack: newRedoStack,
        undoStack: [
          ...undoStack,
          {
            type: 'transform',
            nodeId: entry.nodeId,
            prevValue: result.currentValue,
          },
        ],
      });
    } else if (entry.type === 'textAreaResize') {
      if (!svgTree) return;
      const currentTransform = swapNodeTransform(
        nodeMap,
        entry.nodeId,
        entry.prevTransform
      );
      if (currentTransform === null) return;

      set({
        svgTree: { ...svgTree },
        assignments: entry.prevAssignments,
        redoStack: newRedoStack,
        undoStack: [
          ...undoStack,
          {
            type: 'textAreaResize',
            nodeId: entry.nodeId,
            prevAssignments: assignments,
            prevTransform: currentTransform,
          },
        ],
      });
    } else if (entry.type === 'textAlignChange') {
      if (!svgTree) return;
      const rawNode = nodeMap.get(entry.nodeId);
      if (!rawNode) return;
      const node = asElementNode(rawNode);
      if (!node) return;

      const currentSnapshot = snapshotTextAlign(node);
      restoreTextAlign(node, entry.prevSnapshot);

      set({
        svgTree: { ...svgTree },
        assignments: entry.prevAssignments,
        redoStack: newRedoStack,
        undoStack: [
          ...undoStack,
          {
            type: 'textAlignChange',
            nodeId: entry.nodeId,
            prevAssignments: assignments,
            prevSnapshot: currentSnapshot,
          },
        ],
      });
    } else if (entry.type === 'fontSizeChange') {
      if (!svgTree) return;
      const result = swapFontSize(
        nodeMap,
        entry.nodeId,
        entry.prevStyle,
        entry.prevFontSize
      );
      if (!result) return;
      set({
        svgTree: { ...svgTree },
        redoStack: newRedoStack,
        undoStack: [
          ...undoStack,
          {
            type: 'fontSizeChange',
            nodeId: entry.nodeId,
            prevStyle: result.currentStyle,
            prevFontSize: result.currentFontSize,
          },
        ],
      });
    } else if (entry.type === 'deleteNode') {
      if (!svgTree) return;
      const parentNode = nodeMap.get(entry.parentNodeId);
      if (!parentNode || parentNode.type !== 'element') return;

      parentNode.children.splice(entry.childIndex, 1);

      set({
        ...applyNodeDeletion(entry, { svgTree, ...rest }),
        redoStack: newRedoStack,
        undoStack: [
          ...undoStack,
          {
            type: 'deleteNode',
            parentNodeId: entry.parentNodeId,
            childIndex: entry.childIndex,
            node: entry.node,
            prevAssignments: assignments,
          },
        ],
      });
    }
  },
}));
