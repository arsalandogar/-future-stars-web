import { useMemo } from 'react';
import { ScrollArea } from '@mantine/core';

import { useAnnotatorStore } from '../stores/annotator-store';
import type { FieldAssignment } from '../types';
import { ElementTreeNode } from './element-tree-node';

import styles from './element-tree.module.css';

export function ElementTree() {
  const svgTree = useAnnotatorStore((s) => s.svgTree);
  const nodeIndex = useAnnotatorStore((s) => s.nodeIndex);
  const assignments = useAnnotatorStore((s) => s.assignments);

  const assignmentsByNode = useMemo(() => {
    const map = new Map<string, FieldAssignment[]>();
    for (const a of assignments) {
      const list = map.get(a.nodeId);
      if (list) list.push(a);
      else map.set(a.nodeId, [a]);
    }
    return map;
  }, [assignments]);

  if (!svgTree) return null;

  const rootId = svgTree.attributes['__nodeId'];
  const rootMeta = rootId ? nodeIndex.get(rootId) : undefined;

  if (!rootMeta) return null;

  return (
    <ScrollArea h="100%">
      <div className={styles.tree}>
        <ElementTreeNode
          node={svgTree}
          meta={rootMeta}
          assignmentsByNode={assignmentsByNode}
        />
      </div>
    </ScrollArea>
  );
}
