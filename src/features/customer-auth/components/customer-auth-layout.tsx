import type { ReactNode } from 'react';

import { Center, Image, Paper, Stack, Text, Title } from '@mantine/core';

import hLogoWhite from '@/assets/logos/h-logo-white.png';
import { Head } from '@/components/seo/head';

interface CustomerAuthLayoutProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function CustomerAuthLayout({
  title,
  description,
  children,
}: CustomerAuthLayoutProps) {
  return (
    <>
      <Head title={title} description={description} />
      <Center
        h="100vh"
        w="100vw"
        p="md"
        style={{
          background:
            'linear-gradient(180deg, var(--mantine-color-dark-9) 0%, var(--mantine-color-dark-7) 100%)',
        }}
      >
        <Stack gap="xl" align="center" w="100%" maw={440}>
          <Image
            src={hLogoWhite}
            alt="Future Stars"
            h={48}
            w="auto"
            fit="contain"
          />
          <Paper
            shadow="xl"
            p={{ base: 'lg', sm: 'xl' }}
            radius="lg"
            w="100%"
            bg="dark.8"
          >
            <Stack gap="xl">
              <Stack gap={4} ta="center">
                <Title order={2} fw={700} c="white">
                  {title}
                </Title>
                {description && (
                  <Text c="dimmed" size="sm">
                    {description}
                  </Text>
                )}
              </Stack>
              {children}
            </Stack>
          </Paper>
        </Stack>
      </Center>
    </>
  );
}
