import { useCallback, useRef, useEffect } from 'react';
import { Badge } from '@mantine/core';
import { ChevronRight, Image, Palette, Type } from 'lucide-react';

import type { SvgJsonNode } from '@/types/svg';
import { EDITABLE_FIELDS } from '@/features/templates';

import type { FieldAssignment, NodeMeta } from '../types';
import { useAnnotatorStore } from '../stores/annotator-store';

import styles from './element-tree.module.css';

interface ElementTreeNodeProps {
  node: SvgJsonNode;
  meta: NodeMeta;
  assignmentsByNode: Map<string, FieldAssignment[]>;
  visibleNodeIds: Set<string> | null;
}

function TagIcon({ meta }: { meta: NodeMeta }) {
  if (meta.isTextElement)
    return <Type size={12} className={styles.tagIconText} />;
  if (meta.isImageElement)
    return <Image size={12} className={styles.tagIconImage} />;
  if (meta.hasFill || meta.hasStroke || meta.hasStopColor)
    return <Palette size={12} className={styles.tagIconColor} />;
  return null;
}

function NodeLabel({ label }: { label: string }) {
  // Split label into tag portion and rest (e.g. "<rect> Background" -> ["<rect>", " Background"])
  const match = label.match(/^(<[^>]+>)(.*)/);
  if (match) {
    return (
      <>
        <span className={styles.tagName}>{match[1]}</span>
        {match[2]}
      </>
    );
  }
  return <>{label}</>;
}

export function ElementTreeNode({
  node,
  meta,
  assignmentsByNode,
  visibleNodeIds,
}: ElementTreeNodeProps) {
  const ref = useRef<HTMLDivElement>(null);
  const nodeId = meta.nodeId;
  const isSelected = useAnnotatorStore((s) => s.selectedNodeId === nodeId);
  const isHovered = useAnnotatorStore((s) => s.hoveredNodeId === nodeId);
  const isExpanded = useAnnotatorStore((s) => s.expandedNodeIds.has(nodeId));
  const selectNode = useAnnotatorStore((s) => s.selectNode);
  const hoverNode = useAnnotatorStore((s) => s.hoverNode);
  const toggleExpanded = useAnnotatorStore((s) => s.toggleExpanded);
  const nodeIndex = useAnnotatorStore((s) => s.nodeIndex);
  const hasChildren = node.children.filter((c) => c.type !== 'text').length > 0;

  // Scroll into view when selected from canvas
  useEffect(() => {
    if (isSelected && ref.current) {
      ref.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [isSelected]);

  const handleClick = useCallback(() => {
    // For tspan, select parent text element
    if (meta.tagName === 'tspan' && meta.parentNodeId) {
      selectNode(meta.parentNodeId);
    } else {
      selectNode(nodeId);
    }
  }, [meta.tagName, meta.parentNodeId, nodeId, selectNode]);

  const handleChevronClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      toggleExpanded(nodeId);
    },
    [nodeId, toggleExpanded]
  );

  const nodeAssignments = assignmentsByNode.get(nodeId);
  const hasAssignments = nodeAssignments && nodeAssignments.length > 0;

  // Skip this node if search is active and it's not in the visible set
  if (visibleNodeIds && !visibleNodeIds.has(nodeId)) return null;

  return (
    <>
      <div
        ref={ref}
        className={styles.node}
        data-selected={isSelected}
        data-hovered={isHovered}
        data-has-assignments={hasAssignments || undefined}
        style={{ paddingLeft: `${meta.depth * 16 + 4}px` }}
        onClick={handleClick}
        onMouseEnter={() => hoverNode(nodeId)}
        onMouseLeave={() => hoverNode(null)}
      >
        {hasChildren ? (
          <div
            className={styles.chevron}
            data-expanded={isExpanded}
            onClick={handleChevronClick}
          >
            <ChevronRight size={14} />
          </div>
        ) : (
          <div className={styles.chevronPlaceholder} />
        )}

        <TagIcon meta={meta} />

        <span className={styles.label}>
          <NodeLabel label={meta.label} />
        </span>

        {hasAssignments && (
          <div className={styles.badges}>
            {nodeAssignments.map((a) => (
              <Badge key={a.fieldId} size="xs" variant="light">
                {EDITABLE_FIELDS[a.fieldId].label}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {(isExpanded || visibleNodeIds) &&
        node.children
          .filter((child) => child.type !== 'text')
          .map((child) => {
            const childId = child.attributes['__nodeId'];
            if (!childId) return null;
            const childMeta = nodeIndex.get(childId);
            if (!childMeta) return null;
            return (
              <ElementTreeNode
                key={childId}
                node={child}
                meta={childMeta}
                assignmentsByNode={assignmentsByNode}
                visibleNodeIds={visibleNodeIds}
              />
            );
          })}
    </>
  );
}
