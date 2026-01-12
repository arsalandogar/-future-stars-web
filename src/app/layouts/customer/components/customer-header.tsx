import { Burger, Button, Container, Group, Image } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Link } from '@tanstack/react-router';
import { UserStar } from 'lucide-react';

import hLogoWhite from '@/assets/logos/h-logo-white.png';
import { useAuthStore } from '@/stores/auth-store';

import { CartButton } from './cart-button';
import classes from './customer-header.module.css';
import { MobileMenu } from './mobile-menu';
import { NavLinks } from './nav-links';

export function CustomerHeader() {
  const user = useAuthStore((state) => state.user);
  const [
    mobileMenuOpened,
    { toggle: toggleMobileMenu, close: closeMobileMenu },
  ] = useDisclosure(false);

  return (
    <>
      <Container size="xl" h="100%">
        <Group h="100%" justify="space-between">
          <Link to="/">
            <Image
              src={hLogoWhite}
              alt="Future Stars"
              h={40}
              w="auto"
              fit="contain"
            />
          </Link>

          <Group gap="xl" visibleFrom="sm" className={classes.navContainer}>
            <NavLinks />
          </Group>

          <Group gap="md" visibleFrom="sm">
            <Button component={Link} to="/create-card">
              CREATE A CARD
            </Button>
            <CartButton />
            {user?.isAdmin && (
              <Button
                component={Link}
                to="/admin"
                variant="light"
                leftSection={<UserStar size={16} />}
              >
                Admin
              </Button>
            )}
          </Group>

          <Group gap="xs" hiddenFrom="sm">
            <CartButton />
            <Burger
              opened={mobileMenuOpened}
              onClick={toggleMobileMenu}
              color="white"
              aria-label="Toggle navigation menu"
            />
          </Group>
        </Group>
      </Container>

      <MobileMenu
        opened={mobileMenuOpened}
        onClose={closeMobileMenu}
        isAdmin={user?.isAdmin}
      />
    </>
  );
}
