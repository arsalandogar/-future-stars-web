import { useEffect, useRef, useState } from 'react';
import { ActionIcon } from '@mantine/core';
import { X } from 'lucide-react';

import { useCardEditorStore } from '../stores/card-editor-store';
import type { EditableTextField } from '../utils/svg-editable-fields';

import styles from './content-tab.module.css';

interface ContentFieldProps {
  field: EditableTextField;
}

export function ContentField({ field }: ContentFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState(false);
  const edits = useCardEditorStore((s) => s.edits);
  const updateTextField = useCardEditorStore((s) => s.updateTextField);
  const resetField = useCardEditorStore((s) => s.resetField);
  const isFocusTarget = useCardEditorStore(
    (s) => s.focusedFieldId === field.fieldId
  );
  const setFocusedFieldId = useCardEditorStore((s) => s.setFocusedFieldId);

  useEffect(() => {
    if (isFocusTarget) {
      inputRef.current?.focus();
      setFocusedFieldId(null);
    }
  }, [isFocusTarget, setFocusedFieldId]);

  const currentValue = edits[field.fieldId] ?? field.originalValue;
  const isEdited = field.fieldId in edits;

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
