import { useCallback, useMemo } from 'react';

import type { SvgJsonNode } from '@/types/svg';
import { SvgRenderer } from '@/components/svg-renderer/svg-renderer';

import { useAnnotatorStore } from '../stores/annotator-store';
import { isNonInteractive } from '../utils/svg-node-helpers';

import styles from './annotator-canvas.module.css';

export function AnnotatorCanvas() {
  const svgTree = useAnnotatorStore((s) => s.svgTree);
  const selectedNodeId = useAnnotatorStore((s) => s.selectedNodeId);
  const hoveredNodeId = useAnnotatorStore((s) => s.hoveredNodeId);
  const selectNode = useAnnotatorStore((s) => s.selectNode);
  const hoverNode = useAnnotatorStore((s) => s.hoverNode);

  const getNodeProps = useCallback(
    (node: SvgJsonNode) => {
      if (node.type === 'text') return undefined;
      if (isNonInteractive(node)) return undefined;

      const nodeId = node.attributes['__nodeId'];
      if (!nodeId) return undefined;

      return {
        'data-node-id': nodeId,
        onClick: (e: React.MouseEvent) => {
          e.stopPropagation();
          selectNode(nodeId);
        },
        onMouseEnter: () => hoverNode(nodeId),
        onMouseLeave: () => hoverNode(null),
        style: {
          cursor: 'pointer',
          outlineOffset: '1px',
          transition: 'box-shadow 150ms ease, outline 150ms ease',
          borderRadius: '2px',
        },
      };
    },
    [selectNode, hoverNode]
  );

  // Inject dynamic <style> for hover/selection highlights so getNodeProps stays stable
  const highlightStyle = useMemo(() => {
    const rules: string[] = [];
    if (selectedNodeId) {
      rules.push(
        `[data-node-id="${selectedNodeId}"] { outline: 2px solid var(--mantine-color-primary-4); }`
      );
    }
    if (hoveredNodeId && hoveredNodeId !== selectedNodeId) {
      rules.push(
        `[data-node-id="${hoveredNodeId}"] { outline: 2px dashed var(--mantine-color-primary-3); }`
      );
    }
    if (rules.length === 0) return null;
    return <style>{rules.join('\n')}</style>;
  }, [selectedNodeId, hoveredNodeId]);

  if (!svgTree) return null;

  return (
    <div className={styles.canvas} onClick={() => selectNode(null)}>
      {highlightStyle}
      <div className={styles.svgWrapper}>
        <SvgRenderer node={svgTree} options={{ getNodeProps }} />
      </div>
    </div>
  );
}
