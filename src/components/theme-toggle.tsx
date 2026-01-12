import {
  ActionIcon,
  useComputedColorScheme,
  useMantineColorScheme,
} from '@mantine/core';
import { Moon, Sun } from 'lucide-react';

export function ThemeToggle() {
  const { toggleColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme('dark');

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
