import {
  Anchor,
  Box,
  Container,
  Group,
  Image,
  SimpleGrid,
  Stack,
  Text,
} from '@mantine/core';
import { Link } from '@tanstack/react-router';
import { Facebook, Instagram, Twitter } from 'lucide-react';

import hLogoWhite from '@/assets/logos/h-logo-white.png';

import classes from './customer-footer.module.css';

function AppleIcon() {
  return (
    <svg width="20" height="24" viewBox="0 0 20 24" fill="white">
      <path d="M16.52 12.46c-.03-2.87 2.34-4.25 2.45-4.32-1.33-1.95-3.41-2.22-4.15-2.25-1.77-.18-3.45 1.04-4.34 1.04-.9 0-2.28-1.02-3.75-.99-1.93.03-3.71 1.12-4.7 2.85-2.01 3.48-.51 8.63 1.44 11.46.96 1.38 2.1 2.94 3.6 2.88 1.44-.06 1.99-.93 3.73-.93s2.24.93 3.76.9c1.56-.03 2.54-1.41 3.48-2.8 1.1-1.6 1.55-3.16 1.58-3.24-.03-.02-3.03-1.16-3.06-4.6h-.04zM13.67 3.8c.8-.96 1.33-2.3 1.19-3.64-1.15.05-2.54.77-3.36 1.73-.74.85-1.38 2.22-1.21 3.53 1.28.1 2.59-.65 3.38-1.62z" />
    </svg>
  );
}

function PlayStoreIcon() {
  return (
    <svg width="20" height="22" viewBox="0 0 20 22" fill="none">
      <path
        d="M1.22 0.27C0.96 0.54 0.81 0.96 0.81 1.51V20.49C0.81 21.04 0.96 21.46 1.22 21.73L1.29 21.8L11.73 11.36V11.14V10.92L1.29 0.48L1.22 0.27Z"
        fill="#4285F4"
      />
      <path
        d="M15.21 14.84L11.73 11.36V11.14V10.92L15.21 7.44L15.3 7.49L19.42 9.85C20.6 10.52 20.6 11.62 19.42 12.29L15.3 14.65L15.21 14.84Z"
        fill="#FBBC04"
      />
      <path
        d="M15.3 14.79L11.73 11.22L1.22 21.73C1.59 22.12 2.19 22.17 2.88 21.78L15.3 14.79Z"
        fill="#EA4335"
      />
      <path
        d="M15.3 7.49L2.88 0.5C2.19 0.11 1.59 0.16 1.22 0.55L11.73 11.06L15.3 7.49Z"
        fill="#34A853"
      />
    </svg>
  );
}

const CURRENT_YEAR = new Date().getFullYear();

interface FooterLink {
  label: string;
  to: string;
}

interface SocialLink {
  icon: React.ComponentType<{ size?: number }>;
  href: string;
  label: string;
}

const PRODUCT_LINKS: FooterLink[] = [
  { label: 'Pricing', to: '#' },
  { label: 'Team Orders', to: '#' },
  { label: 'About Us', to: '#' },
];

const SUPPORT_LINKS: FooterLink[] = [
  { label: 'Help Center', to: '#' },
  { label: 'Order Status', to: '#' },
  { label: 'Contact Us', to: '#' },
];

const SOCIAL_LINKS: SocialLink[] = [
  { icon: Facebook, href: '#', label: 'Facebook' },
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Instagram, href: '#', label: 'Instagram' },
];

const LEGAL_LINKS: FooterLink[] = [
  { label: 'Privacy Policy', to: '/privacy-policy' },
  { label: 'Terms & Conditions', to: '/terms-and-conditions' },
  { label: 'Cookie Policy', to: '#' },
];

interface FooterLinkSectionProps {
  title: string;
  links: FooterLink[];
}

function FooterLinkSection({ title, links }: FooterLinkSectionProps) {
  return (
    <Stack gap="xs">
      <Text fw={700} size="sm" c="white" tt="uppercase" mb="xs">
        {title}
      </Text>
      {links.map((link) => (
        <Anchor
          key={link.label}
          component={Link}
          to={link.to}
          className={classes.footerLink}
        >
          {link.label}
        </Anchor>
      ))}
    </Stack>
  );
}

export function CustomerFooter() {
  return (
    <Box component="footer" className={classes.footer}>
      <Container size="xl" py="xl">
        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="xl">
          {/* Logo & App Store Badges */}
          <Stack gap="md">
            <Image
              src={hLogoWhite}
              alt="Future Stars"
              h={40}
              w="auto"
              fit="contain"
            />
            <Group gap="sm" mt="sm">
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className={classes.appBadge}
                aria-label="Download on the App Store"
              >
                <AppleIcon />
                <span className={classes.appBadgeText}>
                  <span className={classes.appBadgeSmall}>Download on the</span>
                  <span className={classes.appBadgeLarge}>App Store</span>
                </span>
              </a>
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className={classes.appBadge}
                aria-label="Get it on Google Play"
              >
                <PlayStoreIcon />
                <span className={classes.appBadgeText}>
                  <span className={classes.appBadgeSmall}>GET IT ON</span>
                  <span className={classes.appBadgeLarge}>Google Play</span>
                </span>
              </a>
            </Group>
          </Stack>

          <FooterLinkSection title="Product" links={PRODUCT_LINKS} />
          <FooterLinkSection title="Support" links={SUPPORT_LINKS} />

          {/* Social Links */}
          <Stack gap="xs">
            <Text fw={700} size="sm" c="white" tt="uppercase" mb="xs">
              Follow Us
            </Text>
            <Group gap="sm">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={classes.socialIcon}
                  aria-label={`Follow us on ${social.label}`}
                >
                  <social.icon size={20} />
                </a>
              ))}
            </Group>
          </Stack>
        </SimpleGrid>
      </Container>

      {/* Bottom Bar */}
      <Box className={classes.bottomBar}>
        <Container size="xl" py="md">
          <Group justify="space-between" wrap="wrap" gap="md">
            <Text size="sm" c="gray.5">
              &copy; {CURRENT_YEAR} Future Stars Inc. All Rights Reserved
            </Text>
            <Group gap="md">
              {LEGAL_LINKS.map((link) => (
                <Anchor
                  key={link.label}
                  component={Link}
                  to={link.to}
                  className={classes.footerLink}
                >
                  {link.label}
                </Anchor>
              ))}
            </Group>
          </Group>
        </Container>
      </Box>
    </Box>
  );
}
