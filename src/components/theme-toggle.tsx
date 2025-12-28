import { ActionIcon, useComputedColorScheme } from '@mantine/core';
import { Moon, Sun } from 'lucide-react';

import { useThemeStore } from '@/stores/theme-store';

export function ThemeToggle() {
  const toggleColorScheme = useThemeStore((state) => state.toggleColorScheme);
  const computedColorScheme = useComputedColorScheme('light');

  return (
    <ActionIcon
      onClick={toggleColorScheme}
      variant="default"
      size="lg"
      radius="xl"
      aria-label="Toggle theme"
    >
      {computedColorScheme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
    </ActionIcon>
  );
}
