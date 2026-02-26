import { EDITABLE_FIELDS, type EditableFieldId } from '@/features/templates';

import type { FieldAssignment, NodeMeta, ValidationResult } from '../types';

export function runValidation(
  assignments: FieldAssignment[],
  nodeIndex: Map<string, NodeMeta>
): ValidationResult[] {
  const results: ValidationResult[] = [];

  if (assignments.length === 0) {
    results.push({
      severity: 'error',
      code: 'NO_ASSIGNMENTS',
      message: 'No fields have been assigned yet.',
    });
    return results;
  }

  // Check type mismatches
  for (const assignment of assignments) {
    const meta = nodeIndex.get(assignment.nodeId);
    if (!meta) continue;

    const field = EDITABLE_FIELDS[assignment.fieldId];
    const fieldType = field.type;

    if (fieldType === 'text' && !meta.isTextElement) {
      results.push({
        severity: 'error',
        code: 'TYPE_MISMATCH',
        message: `Text field "${field.label}" assigned to non-text element <${meta.tagName}>.`,
        nodeId: assignment.nodeId,
        fieldId: assignment.fieldId,
      });
    }

    if (fieldType === 'image' && !meta.isImageElement) {
      results.push({
        severity: 'error',
        code: 'TYPE_MISMATCH',
        message: `Image field "${field.label}" assigned to non-image element <${meta.tagName}>.`,
        nodeId: assignment.nodeId,
        fieldId: assignment.fieldId,
      });
    }

    if (
      fieldType === 'color' &&
      !meta.hasFill &&
      !meta.hasStroke &&
      !meta.hasStopColor
    ) {
      results.push({
        severity: 'error',
        code: 'TYPE_MISMATCH',
        message: `Color field "${field.label}" assigned to element without fill, stroke, or stop-color.`,
        nodeId: assignment.nodeId,
        fieldId: assignment.fieldId,
      });
    }
  }

  // Check duplicate text/image fields (should only be assigned once)
  const fieldAssignmentCounts = new Map<EditableFieldId, number>();
  for (const assignment of assignments) {
    const count = fieldAssignmentCounts.get(assignment.fieldId) ?? 0;
    fieldAssignmentCounts.set(assignment.fieldId, count + 1);
  }

  for (const [fieldId, count] of fieldAssignmentCounts) {
    if (count <= 1) continue;
    const field = EDITABLE_FIELDS[fieldId];
    if (field.type === 'color') continue; // Color fields can be multi-assigned

    results.push({
      severity: 'error',
      code: 'DUPLICATE_FIELD',
      message: `${field.type === 'text' ? 'Text' : 'Image'} field "${field.label}" is assigned to ${count} elements. It should only be assigned to one.`,
      fieldId,
    });
  }

  // Check for missing max-width on text fields
  for (const assignment of assignments) {
    const field = EDITABLE_FIELDS[assignment.fieldId];
    if (field.type === 'text' && assignment.maxWidth == null) {
      results.push({
        severity: 'warning',
        code: 'MISSING_MAX_WIDTH',
        message: `Text field "${field.label}" has no max-width computed.`,
        nodeId: assignment.nodeId,
        fieldId: assignment.fieldId,
      });
    }
  }

  // Check for unassigned image fields
  const assignedFields = new Set(assignments.map((a) => a.fieldId));
  const imageFieldIds = (
    Object.keys(EDITABLE_FIELDS) as EditableFieldId[]
  ).filter((id) => EDITABLE_FIELDS[id].type === 'image');
  const unassignedImageIds = imageFieldIds.filter(
    (id) => !assignedFields.has(id)
  );

  if (unassignedImageIds.length > 0) {
    results.push({
      severity: 'warning',
      code: 'UNUSED_IMAGE_FIELDS',
      message: `Unassigned image fields: ${unassignedImageIds.map((id) => EDITABLE_FIELDS[id].label).join(', ')}.`,
    });
  }

  // Check for color fields assigned to only one element
  for (const [fieldId, count] of fieldAssignmentCounts) {
    if (count !== 1) continue;
    const field = EDITABLE_FIELDS[fieldId];
    if (field.type !== 'color') continue;

    results.push({
      severity: 'warning',
      code: 'SINGLE_COLOR_ELEMENT',
      message: `Color field "${field.label}" is assigned to only one element.`,
      fieldId,
    });
  }

  return results;
}
