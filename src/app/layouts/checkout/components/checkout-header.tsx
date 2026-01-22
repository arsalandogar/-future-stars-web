import { Container, Group, Image, Text } from '@mantine/core';
import { Link } from '@tanstack/react-router';
import { Lock } from 'lucide-react';

import hLogoWhite from '@/assets/logos/h-logo-white.png';

import styles from './checkout-header.module.css';

export function CheckoutHeader() {
  return (
    <Container size="xxl" h="100%">
      <Group h="100%" justify="space-between">
        <Link to="/">
          <Image src={hLogoWhite} alt="Future Stars" h={40} w="auto" />
        </Link>

        <Group gap="xs" className={styles.secureCheckout}>
          <Lock size={18} />
          <Text fw={600} size="lg" tt="uppercase" className={styles.secureText}>
            Secure Checkout
          </Text>
        </Group>

        <div className={styles.spacer} />
      </Group>
    </Container>
  );
}
