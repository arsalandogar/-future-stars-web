import type { SvgJsonNode } from './types.ts';

interface TextLayoutSnapshot {
  value: string;
  children: SvgJsonNode[];
}

const textLayoutSnapshots = new WeakMap<SvgJsonNode, TextLayoutSnapshot>();
const logicalTextValues = new WeakMap<SvgJsonNode, string>();
const autoWrappedTextNodes = new WeakSet<SvgJsonNode>();

export function collectTextContent(node: SvgJsonNode): string {
  if (node.type === 'text') return node.value;
  return node.children.map(collectTextContent).join('');
}

function cloneChildren(children: SvgJsonNode[]): SvgJsonNode[] {
  return structuredClone(children);
}

function collectTextNodes(
  node: SvgJsonNode,
  acc: SvgJsonNode[] = []
): SvgJsonNode[] {
  if (node.type === 'text') {
    acc.push(node);
    return acc;
  }

  for (const child of node.children) {
    collectTextNodes(child, acc);
  }

  return acc;
}

export function createTextNode(value: string): SvgJsonNode {
  return { type: 'text', value } as SvgJsonNode;
}

export function findFirstTextElement(node: SvgJsonNode): SvgJsonNode | null {
  if (node.type === 'text') return null;
  if (node.name === 'text') return node;

  for (const child of node.children) {
    const found = findFirstTextElement(child);
    if (found) return found;
  }

  return null;
}

export function rememberTextLayout(node: SvgJsonNode): void {
  if (node.type === 'text' || textLayoutSnapshots.has(node)) return;

  textLayoutSnapshots.set(node, {
    value: node.value,
    children: cloneChildren(node.children),
  });
}

export function getLogicalTextContent(node: SvgJsonNode): string {
  if (node.type === 'text') return node.value;
  return logicalTextValues.get(node) ?? collectTextContent(node);
}

export function setLogicalTextContent(node: SvgJsonNode, value: string): void {
  if (node.type === 'text') {
    node.value = value;
    return;
  }

  logicalTextValues.set(node, value);
}

function writeTextIntoStructure(node: SvgJsonNode, value: string): void {
  if (node.type === 'text') {
    node.value = value;
    return;
  }

  const textNodes = collectTextNodes(node);
  if (textNodes.length === 0) {
    node.children.push(createTextNode(value));
    return;
  }

  textNodes[0].value = value;
  for (let i = 1; i < textNodes.length; i += 1) {
    textNodes[i].value = '';
  }
}

export function restoreTextLayout(node: SvgJsonNode, value?: string): void {
  if (node.type === 'text') return;

  rememberTextLayout(node);
  const snapshot = textLayoutSnapshots.get(node);
  if (!snapshot) return;

  node.value = snapshot.value;
  node.children = cloneChildren(snapshot.children);

  const nextValue = value ?? getLogicalTextContent(node);
  writeTextIntoStructure(node, nextValue);
  setLogicalTextContent(node, nextValue);
}

export function isAutoWrappedTextNode(node: SvgJsonNode): boolean {
  return node.type !== 'text' && autoWrappedTextNodes.has(node);
}

export function markAutoWrappedTextNode(node: SvgJsonNode): void {
  if (node.type === 'text') return;
  autoWrappedTextNodes.add(node);
}

export function clearAutoWrappedTextNode(node: SvgJsonNode): void {
  if (node.type === 'text') return;
  autoWrappedTextNodes.delete(node);
}

export function setTextElementContent(
  node: SvgJsonNode,
  value: string
): boolean {
  const textElement =
    node.type === 'text'
      ? null
      : node.name === 'text'
        ? node
        : findFirstTextElement(node);

  if (!textElement) {
    if (collectTextNodes(node).length === 0) return false;
    writeTextIntoStructure(node, value);
    return true;
  }

  restoreTextLayout(textElement, value);
  clearAutoWrappedTextNode(textElement);
  return true;
}
