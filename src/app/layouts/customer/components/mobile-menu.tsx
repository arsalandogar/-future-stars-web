import { Button, Drawer, Stack } from '@mantine/core';
import { Link } from '@tanstack/react-router';
import { UserStar } from 'lucide-react';

import { NavLinks } from './nav-links';

interface MobileMenuProps {
  opened: boolean;
  onClose: () => void;
  isAdmin: boolean;
}

export function MobileMenu({ opened, onClose, isAdmin }: MobileMenuProps) {
  return (
    <Drawer opened={opened} onClose={onClose} position="bottom">
      <Stack gap="xs" px="md">
        <NavLinks onClick={onClose} vertical />
        <Button
          component={Link}
          to="/create-card"
          onClick={onClose}
          fullWidth
          mt="md"
        >
          CREATE A CARD
        </Button>
        {isAdmin && (
          <Button
            component={Link}
            to="/admin"
            onClick={onClose}
            variant="light"
            leftSection={<UserStar size={16} />}
            fullWidth
          >
            Admin Panel
          </Button>
        )}
      </Stack>
    </Drawer>
  );
}
