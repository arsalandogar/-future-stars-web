import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ActionIcon } from '@mantine/core';
import { X } from 'lucide-react';

import { useCardEditorStore } from '../stores/card-editor-store';
import type { EditableTextField } from '@fs-card-engine';

import styles from './content-tab.module.css';

interface ContentFieldProps {
  field: EditableTextField;
}

const MULTILINE_INPUT_MAX_HEIGHT = 144;

export function ContentField({ field }: ContentFieldProps) {
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
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

  useLayoutEffect(() => {
    const element = inputRef.current;
    if (!field.multiline || !(element instanceof HTMLTextAreaElement)) return;

    element.style.height = '0px';

    const nextHeight = Math.min(
      element.scrollHeight,
      MULTILINE_INPUT_MAX_HEIGHT
    );

    element.style.height = `${nextHeight}px`;
    element.style.overflowY =
      element.scrollHeight > MULTILINE_INPUT_MAX_HEIGHT ? 'auto' : 'hidden';
  }, [currentValue, field.multiline]);

  function handleChange(value: string) {
    updateTextField(field.fieldId, value);
  }

  function handleInputRef(node: HTMLInputElement | HTMLTextAreaElement | null) {
    inputRef.current = node;
  }

  return (
    <div
      className={styles.field}
      data-focused={focused || undefined}
      data-multiline={field.multiline || undefined}
    >
      <div
        className={styles.indicator}
        data-filled={currentValue.trim().length > 0 || undefined}
      />
      {field.multiline ? (
        <textarea
          ref={handleInputRef}
          className={styles.input}
          data-multiline="true"
          rows={1}
          placeholder={field.label}
          aria-label={field.label}
          value={currentValue}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
      ) : (
        <input
          ref={handleInputRef}
          className={styles.input}
          type="text"
          placeholder={field.label}
          aria-label={field.label}
          value={currentValue}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
      )}
      {isEdited && (
        <ActionIcon
          className={styles.resetButton}
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
