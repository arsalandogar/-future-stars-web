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
    const v = s.edits[field.fieldId];
    return typeof v === 'string' ? v : undefined;
  });
  const updateTextField = useCardEditorStore((s) => s.updateTextField);
  const resetField = useCardEditorStore((s) => s.resetField);

  useEffect(() => {
    function handleFocusChange() {
      const { focusedFieldId, setFocusedFieldId } =
        useCardEditorStore.getState();
      if (focusedFieldId === field.fieldId) {
        inputRef.current?.focus();
        setFocusedFieldId(null);
      }
    }
    handleFocusChange(); // handle focus target set before mount
    return useCardEditorStore.subscribe(handleFocusChange);
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
