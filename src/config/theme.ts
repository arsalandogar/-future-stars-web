import { createTheme } from '@mantine/core';

export const theme = createTheme({
  fontFamily:
    'Poppins, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
  components: {
    Modal: {
      defaultProps: {
        centered: true,
      },
    },
    InputWrapper: {
      styles: {
        error: {
          fontSize: 'var(--mantine-font-size-xs)',
        },
      },
    },
  },
});
