import { notifications } from '@mantine/notifications';

import type { TextCompressionWarning } from '@fs-card-engine';

import type { Side } from '@fs-card-engine';

const seenWarningKeys = new Set<string>();

function warningKey(side: Side, warning: TextCompressionWarning): string {
  return [
    side,
    warning.reason,
    warning.nodeId ?? 'unknown-node',
    warning.message,
  ].join('|');
}

function toUserMessage(warning: TextCompressionWarning): string {
  switch (warning.reason) {
    case 'font-not-found':
      return 'Font data was not found for one or more text fields. Some text may not fit as expected.';
    case 'parse-failed':
      return 'Font parsing failed for one or more text fields. Some text may not fit as expected.';
    case 'unsupported-mixed-style':
      return 'Mixed-style text (styled tspans/textPath) is not compressed automatically.';
    case 'invalid-max-width':
      return 'A text field has an invalid data-max-width value, so compression was skipped.';
    default:
      return warning.message;
  }
}

export function reportTextCompressionWarning(
  side: Side,
  warning: TextCompressionWarning
): void {
  const key = warningKey(side, warning);
  if (seenWarningKeys.has(key)) return;
  seenWarningKeys.add(key);

  if (import.meta.env.DEV) {
    notifications.show({
      color: 'yellow',
      title: `Text compression warning (${side})`,
      message: toUserMessage(warning),
      autoClose: 6000,
    });
    console.warn('[text-compression]', { side, ...warning });
  }
}

export function clearTextCompressionWarningCache(): void {
  seenWarningKeys.clear();
}
