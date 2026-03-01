import { useCallback, useState } from 'react';

import { cloneWithStableIds } from '@fs-card-engine';

import { useAnnotatorStore } from '../stores/annotator-store';
import { parseSvgString } from '../utils/parse-svg';
import { buildNodeIndex } from '../utils/svg-node-helpers';

export function useSvgFileReader() {
  const [error, setError] = useState<string | null>(null);
  const loadSvg = useAnnotatorStore((s) => s.loadSvg);

  const processSvgString = useCallback(
    (raw: string, fileName: string) => {
      try {
        const parsed = parseSvgString(raw);
        const tree = cloneWithStableIds(parsed);
        const { nodeIndex, nodeMap } = buildNodeIndex(tree);
        loadSvg(tree, raw, fileName, nodeIndex, nodeMap);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to parse SVG.');
      }
    },
    [loadSvg]
  );

  const readFile = useCallback(
    (file: File) => {
      setError(null);

      if (!file.name.endsWith('.svg') && file.type !== 'image/svg+xml') {
        setError('Please upload an SVG file.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const raw = e.target?.result as string;
        if (!raw) {
          setError('Failed to read file.');
          return;
        }
        processSvgString(raw, file.name);
      };

      reader.onerror = () => setError('Failed to read file.');
      reader.readAsText(file);
    },
    [processSvgString]
  );

  const loadFromString = useCallback(
    (svgString: string) => {
      setError(null);
      const trimmed = svgString.trim();
      if (!trimmed.startsWith('<svg') && !trimmed.startsWith('<?xml')) {
        setError('Clipboard content is not valid SVG markup.');
        return;
      }
      processSvgString(trimmed, 'pasted.svg');
    },
    [processSvgString]
  );

  return { readFile, loadFromString, error };
}
