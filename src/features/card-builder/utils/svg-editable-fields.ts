import type { SvgJsonNode } from '@/types/svg';

import { EDITABLE_FIELDS, type EditableFieldId } from '@/features/templates';

const TEXT_FIELD_IDS = Object.entries(EDITABLE_FIELDS)
  .filter(([, field]) => field.type === 'text')
  .map(([id]) => id as EditableFieldId);

const TEXT_FIELD_ORDER = new Map(TEXT_FIELD_IDS.map((id, i) => [id, i]));

export interface EditableTextField {
  fieldId: EditableFieldId;
  label: string;
  originalValue: string;
  elementNodes: SvgJsonNode[];
}

function collectTextContent(node: SvgJsonNode): string {
  if (node.type === 'text') return node.value;
  return node.children.map(collectTextContent).join('');
}

function findFirstTextNode(node: SvgJsonNode): SvgJsonNode | null {
  if (node.type === 'text') return node;
  for (const child of node.children) {
    const found = findFirstTextNode(child);
    if (found) return found;
  }
  return null;
}

export function discoverEditableTextFields(
  root: SvgJsonNode
): EditableTextField[] {
  const fieldMap = new Map<EditableFieldId, SvgJsonNode[]>();

  function walk(node: SvgJsonNode) {
    if (node.type === 'text') return;

    const dataField = node.attributes['data-text-field'] as string | undefined;
    if (dataField && TEXT_FIELD_ORDER.has(dataField as EditableFieldId)) {
      const fieldId = dataField as EditableFieldId;
      const existing = fieldMap.get(fieldId);
      if (existing) {
        existing.push(node);
      } else {
        fieldMap.set(fieldId, [node]);
      }
    }

    for (const child of node.children) {
      walk(child);
    }
  }

  walk(root);

  const fields: EditableTextField[] = [];

  for (const [fieldId, elementNodes] of fieldMap) {
    const fieldDef = EDITABLE_FIELDS[fieldId];
    const originalValue = collectTextContent(elementNodes[0]);

    fields.push({
      fieldId,
      label: fieldDef.label,
      originalValue,
      elementNodes,
    });
  }

  fields.sort(
    (a, b) =>
      (TEXT_FIELD_ORDER.get(a.fieldId) ?? 0) -
      (TEXT_FIELD_ORDER.get(b.fieldId) ?? 0)
  );

  return fields;
}

export function applyTextEdit(field: EditableTextField, value: string): void {
  for (const elementNode of field.elementNodes) {
    const textNode = findFirstTextNode(elementNode);
    if (textNode) {
      textNode.value = value;
    }
  }
}
