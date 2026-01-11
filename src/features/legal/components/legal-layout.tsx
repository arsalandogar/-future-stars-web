import { Container, Image } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { Link } from '@tanstack/react-router';

import hLogoBlack from '@/assets/logos/h-logo-black.png';
import hLogoWhite from '@/assets/logos/h-logo-white.png';

interface LegalLayoutProps {
  children: React.ReactNode;
}

export function LegalLayout({ children }: LegalLayoutProps) {
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';
  const logo = isDark ? hLogoWhite : hLogoBlack;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b py-6">
        <Container>
          <Link to="/">
            <Image
              src={logo}
              alt="Future Stars"
              h={40}
              w="auto"
              fit="contain"
            />
          </Link>
        </Container>
      </header>
      <main className="flex-1 py-8">
        <Container>{children}</Container>
      </main>
      <footer className="border-t py-4 text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} Future Stars. All rights reserved.
      </footer>
    </div>
  );
}
