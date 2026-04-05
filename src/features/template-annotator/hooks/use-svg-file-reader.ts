import { useCallback, useState } from 'react';

import { cloneWithStableIds } from '@fs-card-engine';

import { useAnnotatorStore } from '../stores/annotator-store';
import { convertFigmaSvg } from '../utils/convert-figma-svg';
import { extractAssignments } from '../utils/extract-assignments';
import { stripAnnotationAttrs } from '../utils/export-annotated-svg';
import { parseSvgString } from '../utils/parse-svg';
import { buildNodeIndex } from '../utils/svg-node-helpers';

export function useSvgFileReader() {
  const [error, setError] = useState<string | null>(null);
  const loadSvg = useAnnotatorStore((s) => s.loadSvg);

  const processSvgString = useCallback(
    (raw: string, fileName: string, preprocess: boolean) => {
      try {
        const svgString = preprocess ? convertFigmaSvg(raw).svg : raw;
        const parsed = parseSvgString(svgString);
        const tree = cloneWithStableIds(parsed);
        const { nodeIndex, nodeMap } = buildNodeIndex(tree);

        // Extract pre-existing data-* annotations (from Figma conversion or re-uploads)
        const assignments = preprocess ? extractAssignments(nodeMap) : [];

        if (preprocess) {
          stripAnnotationAttrs(tree);
        }

        loadSvg({
          tree,
          rawSvgString: svgString,
          fileName,
          nodeIndex,
          nodeMap,
          assignments,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to parse SVG.');
      }
    },
    [loadSvg]
  );

  const readFile = useCallback(
    (file: File, preprocess: boolean) => {
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
        processSvgString(raw, file.name, preprocess);
      };

      reader.onerror = () => setError('Failed to read file.');
      reader.readAsText(file);
    },
    [processSvgString]
  );

  const loadFromString = useCallback(
    (svgString: string, preprocess: boolean) => {
      setError(null);
      const trimmed = svgString.trim();
      if (!trimmed.startsWith('<svg') && !trimmed.startsWith('<?xml')) {
        setError('Clipboard content is not valid SVG markup.');
        return;
      }
      processSvgString(trimmed, 'pasted.svg', preprocess);
    },
    [processSvgString]
  );

  return { readFile, loadFromString, error };
}
