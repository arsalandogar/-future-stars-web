import type { MantineColor } from '@mantine/core';

import type { PrintBatchStatus } from './types';

export const BATCH_STATUS_COLORS: Record<PrintBatchStatus, MantineColor> = {
  pending: 'gray',
  printing: 'blue',
  printed: 'green',
  error: 'red',
};
