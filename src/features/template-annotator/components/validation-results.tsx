import { useMemo } from 'react';
import { Stack, Text } from '@mantine/core';
import { CircleAlert, CircleCheck, TriangleAlert } from 'lucide-react';

import type { ValidationResult } from '../types';
import { useAnnotatorStore } from '../stores/annotator-store';

import styles from './validation-results.module.css';

export function ValidationResults() {
  const validationResults = useAnnotatorStore((s) => s.validationResults);
  const selectNode = useAnnotatorStore((s) => s.selectNode);

  const { errors, warnings } = useMemo(() => {
    const errors: ValidationResult[] = [];
    const warnings: ValidationResult[] = [];
    for (const r of validationResults) {
      if (r.severity === 'error') errors.push(r);
      else if (r.severity === 'warning') warnings.push(r);
    }
    return { errors, warnings };
  }, [validationResults]);

  if (validationResults.length === 0) {
    return (
      <Text size="sm" c="dimmed" ta="center" py="xl">
        Click "Validate" to check your annotations.
      </Text>
    );
  }

  if (errors.length === 0 && warnings.length === 0) {
    return (
      <div className={styles.successCard}>
        <CircleCheck
          size={20}
          color="var(--mantine-color-green-6)"
          className={styles.successIcon}
        />
        <Text size="sm" c="green">
          All validations passed!
        </Text>
      </div>
    );
  }

  return (
    <Stack gap="xs">
      {errors.map((result) => (
        <div
          key={`err-${result.code}-${result.nodeId ?? result.fieldId ?? ''}`}
          className={styles.resultItem}
          data-severity="error"
          onClick={() => result.nodeId && selectNode(result.nodeId)}
        >
          <CircleAlert
            size={16}
            color="var(--mantine-color-red-6)"
            className={styles.resultIcon}
          />
          <Text size="sm" c="red">
            {result.message}
          </Text>
        </div>
      ))}

      {warnings.map((result) => (
        <div
          key={`warn-${result.code}-${result.nodeId ?? result.fieldId ?? ''}`}
          className={styles.resultItem}
          data-severity="warning"
          onClick={() => result.nodeId && selectNode(result.nodeId)}
        >
          <TriangleAlert
            size={16}
            color="var(--mantine-color-yellow-7)"
            className={styles.resultIcon}
          />
          <Text size="sm" c="yellow.7">
            {result.message}
          </Text>
        </div>
      ))}
    </Stack>
  );
}
