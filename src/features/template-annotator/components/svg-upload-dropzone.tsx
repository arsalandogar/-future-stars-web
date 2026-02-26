import { useCallback, useEffect, useRef, useState } from 'react';
import { Stack, Text } from '@mantine/core';
import { FileUp } from 'lucide-react';

import { useSvgFileReader } from '../hooks/use-svg-file-reader';

import styles from './svg-upload-dropzone.module.css';

export function SvgUploadDropzone() {
  const { readFile, loadFromString, error } = useSvgFileReader();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback(
    (file: File | undefined) => {
      if (file) readFile(file);
    },
    [readFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFile(e.dataTransfer.files[0]);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    function handlePaste(e: ClipboardEvent) {
      // Don't intercept pastes into inputs or textareas
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      const svgFile = Array.from(e.clipboardData?.files ?? []).find(
        (f) => f.type === 'image/svg+xml' || f.name.endsWith('.svg')
      );
      if (svgFile) {
        readFile(svgFile);
        return;
      }

      const text = (e.clipboardData?.getData('text/plain') ?? '').trim();
      if (text.startsWith('<svg') || text.startsWith('<?xml')) {
        loadFromString(text);
      }
    }

    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [readFile, loadFromString]);

  return (
    <Stack align="center" gap="md" className="w-full max-w-lg">
      <div
        className={styles.dropzone}
        data-dragging={isDragging}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
      >
        <div className={styles.iconWrapper}>
          <FileUp
            size={52}
            strokeWidth={1.5}
            color={
              isDragging
                ? 'var(--mantine-color-primary-4)'
                : 'var(--mantine-color-dimmed)'
            }
          />
        </div>
        <div className="text-center">
          <Text size="xl">Drop, paste, or click to select an SVG</Text>
          <Text size="sm" c="dimmed" mt={7}>
            Upload a template SVG to start annotating fields
          </Text>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".svg,image/svg+xml"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {error && (
        <Text c="red" size="sm">
          {error}
        </Text>
      )}
    </Stack>
  );
}
