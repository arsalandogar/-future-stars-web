import { useEffect, useState } from 'react';
import { NumberInput, SimpleGrid } from '@mantine/core';

interface NumericInputField {
  key: string;
  label: string;
  value: number;
  onCommit: (value: number) => void;
  min?: number;
  step?: number;
}

interface NumericInputGridProps {
  fields: NumericInputField[];
  columns?: number;
  mt?: number | string;
}

const INPUT_STYLES = {
  label: {
    fontSize: '10px',
    fontWeight: 700,
    letterSpacing: '0.06em',
    textTransform: 'uppercase' as const,
    color: 'var(--mantine-color-dimmed)',
  },
  input: {
    textAlign: 'center' as const,
  },
};

function buildDrafts(fields: NumericInputField[]) {
  return Object.fromEntries(fields.map((field) => [field.key, field.value]));
}

export function NumericInputGrid({
  fields,
  columns = fields.length,
  mt = 'xs',
}: NumericInputGridProps) {
  const [drafts, setDrafts] = useState<Record<string, string | number>>(() =>
    buildDrafts(fields)
  );
  const syncKey = fields
    .map((field) => `${field.key}:${field.value}`)
    .join('|');

  useEffect(() => {
    setDrafts(buildDrafts(fields));
  }, [syncKey]);

  return (
    <SimpleGrid cols={columns} spacing={4} mt={mt}>
      {fields.map((field) => (
        <NumberInput
          key={field.key}
          size="xs"
          label={field.label}
          value={drafts[field.key] ?? field.value}
          min={field.min}
          step={field.step ?? 0.1}
          hideControls
          styles={INPUT_STYLES}
          onChange={(value) => {
            setDrafts((current) => ({
              ...current,
              [field.key]: value,
            }));
          }}
          onBlur={() => {
            const draft = drafts[field.key];
            if (typeof draft === 'number' && Number.isFinite(draft)) {
              field.onCommit(draft);
            } else {
              setDrafts((current) => ({
                ...current,
                [field.key]: field.value,
              }));
            }
          }}
        />
      ))}
    </SimpleGrid>
  );
}
