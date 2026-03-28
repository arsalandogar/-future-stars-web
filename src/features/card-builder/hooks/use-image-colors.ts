import { useEffect, useState } from 'react';
import { getEditValue } from '@fs-card-engine';
import { useShallow } from 'zustand/react/shallow';

import { useCardEditorStore } from '../stores/card-editor-store';
import { extractDominantColors } from '../utils/extract-image-colors';

export function useImageColors(): {
  colors: string[];
  isLoading: boolean;
} {
  const imageUrls = useCardEditorStore(
    useShallow((s) => {
      const side = s.sides[s.activeSide];
      const urls: string[] = [];
      for (const field of side.editableImageFields) {
        const edited = getEditValue(side.edits[field.fieldId]);
        const url = edited ?? field.originalValue;
        // Skip data: placeholder URLs and empty values
        if (url && !url.startsWith('data:')) {
          urls.push(url);
        }
      }
      return urls;
    })
  );

  const urlsKey = imageUrls.join('|');
  const [colors, setColors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (imageUrls.length === 0) {
      setColors((prev) => (prev.length === 0 ? prev : []));
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    void Promise.all(imageUrls.map((url) => extractDominantColors(url)))
      .then((results) => {
        if (cancelled) return;
        // Merge and deduplicate
        const seen = new Set<string>();
        const merged: string[] = [];
        for (const batch of results) {
          for (const hex of batch) {
            if (!seen.has(hex)) {
              seen.add(hex);
              merged.push(hex);
            }
          }
        }
        setColors(merged.slice(0, 8));
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // urlsKey is a derived string from imageUrls for stable deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlsKey]);

  return { colors, isLoading };
}
