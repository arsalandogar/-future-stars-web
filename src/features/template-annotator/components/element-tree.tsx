import { useMemo, useState } from 'react';
import { ScrollArea, TextInput } from '@mantine/core';
import { Search } from 'lucide-react';

import { useAnnotatorStore } from '../stores/annotator-store';
import type { FieldAssignment } from '../types';
import { ElementTreeNode } from './element-tree-node';

import styles from './element-tree.module.css';

export function ElementTree() {
  const svgTree = useAnnotatorStore((s) => s.svgTree);
  const nodeIndex = useAnnotatorStore((s) => s.nodeIndex);
  const assignments = useAnnotatorStore((s) => s.assignments);
  const [search, setSearch] = useState('');

  const assignmentsByNode = useMemo(() => {
    const map = new Map<string, FieldAssignment[]>();
    for (const a of assignments) {
      const list = map.get(a.nodeId);
      if (list) list.push(a);
      else map.set(a.nodeId, [a]);
    }
    return map;
  }, [assignments]);

  // Build set of node IDs that match search (and their ancestors)
  const visibleNodeIds = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return null; // null = show all

    const matching = new Set<string>();
    for (const [nodeId, meta] of nodeIndex) {
      if (meta.label.toLowerCase().includes(query)) {
        matching.add(nodeId);
        // Include ancestors so tree structure is preserved
        let current = nodeIndex.get(nodeId);
        while (current?.parentNodeId) {
          matching.add(current.parentNodeId);
          current = nodeIndex.get(current.parentNodeId);
        }
      }
    }
    return matching;
  }, [search, nodeIndex]);

  if (!svgTree) return null;

  const rootId = svgTree.attributes['__nodeId'];
  const rootMeta = rootId ? nodeIndex.get(rootId) : undefined;

  if (!rootMeta) return null;

  return (
    <div className="flex h-full flex-col">
      <div className="shrink-0 p-2">
        <TextInput
          placeholder="Filter elements..."
          size="xs"
          leftSection={<Search size={14} />}
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
        />
      </div>
      <ScrollArea className="flex-1">
        <div className={styles.tree}>
          <ElementTreeNode
            node={svgTree}
            meta={rootMeta}
            assignmentsByNode={assignmentsByNode}
            visibleNodeIds={visibleNodeIds}
          />
        </div>
      </ScrollArea>
    </div>
  );
}
