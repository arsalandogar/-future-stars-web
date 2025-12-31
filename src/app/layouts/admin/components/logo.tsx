import { useMantineColorScheme, Image } from '@mantine/core';

import hLogoBlack from '@/assets/logos/h-logo-black.png';
import hLogoWhite from '@/assets/logos/h-logo-white.png';
import logoMarkBlack from '@/assets/logos/logo-mark-black.png';
import logoMarkWhite from '@/assets/logos/logo-mark-white.png';
import { useSidebarStore } from '../stores/sidebar-store';

export function Logo() {
  const { colorScheme } = useMantineColorScheme();
  const collapsed = useSidebarStore((state) => state.collapsed);

  const isDark = colorScheme === 'dark';
  const logo = collapsed
    ? isDark
      ? logoMarkWhite
      : logoMarkBlack
    : isDark
      ? hLogoWhite
      : hLogoBlack;

  return <Image src={logo} alt="Logo" h={40} w="auto" fit="contain" />;
}
