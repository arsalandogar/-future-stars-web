import { Box } from '@mantine/core';

export function Logo() {
  return (
    <Box
      w={32}
      h={32}
      className="flex items-center justify-center rounded-lg bg-(--mantine-color-dark-9)"
    >
      <Box
        w={16}
        h={16}
        className="rounded-full border-2 border-(--mantine-color-white)"
      />
    </Box>
  );
}
