import { useEffect, useRef, useState } from 'react';
import { ActionIcon } from '@mantine/core';
import { X } from 'lucide-react';

import { useCardEditorStore } from '../stores/card-editor-store';
import type { EditableTextField } from '@fs-card-engine';

import styles from './content-tab.module.css';

interface ContentFieldProps {
  field: EditableTextField;
}

export function ContentField({ field }: ContentFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState(false);
  const editedValue = useCardEditorStore((s) => {
    const v = s.sides[s.activeSide].edits[field.fieldId];
    return typeof v === 'string' ? v : undefined;
  });
  const updateTextField = useCardEditorStore((s) => s.updateTextField);
  const resetField = useCardEditorStore((s) => s.resetField);

  useEffect(() => {
    function handleFocus(focusedFieldId: string | null) {
      if (focusedFieldId === field.fieldId) {
        inputRef.current?.focus();
        useCardEditorStore.getState().setFocusedFieldId(null);
      }
    }

    // Handle focus target set before mount
    handleFocus(useCardEditorStore.getState().focusedFieldId);

    return useCardEditorStore.subscribe((state, previousState) => {
      if (state.focusedFieldId === previousState.focusedFieldId) return;
      handleFocus(state.focusedFieldId);
    });
  }, [field.fieldId]);

  const currentValue = editedValue ?? field.originalValue;
  const isEdited = editedValue !== undefined;

  return (
    <div className={styles.field} data-focused={focused || undefined}>
      <div
        className={styles.indicator}
        data-filled={currentValue.trim().length > 0 || undefined}
      />
      <input
        ref={inputRef}
        className={styles.input}
        type="text"
        placeholder={field.label}
        aria-label={field.label}
        value={currentValue}
        onChange={(e) => updateTextField(field.fieldId, e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      {isEdited && (
        <ActionIcon
          variant="subtle"
          color="gray"
          size="sm"
          onClick={() => resetField(field.fieldId)}
          aria-label={`Reset ${field.label}`}
        >
          <X size={14} />
        </ActionIcon>
      )}
    </div>
  );
}
