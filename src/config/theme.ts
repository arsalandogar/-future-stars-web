import { createTheme } from '@mantine/core';

export const theme = createTheme({
  components: {
    InputWrapper: {
      styles: {
        error: {
          fontSize: 'var(--mantine-font-size-xs)',
        },
      },
    },
  },
});
