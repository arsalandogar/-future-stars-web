import type { ReactNode } from 'react';

import { Center, Paper, Stack, Text, Title } from '@mantine/core';

import { Head } from '@/components/seo/head';

type AuthLayoutProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export function AuthLayout({ title, description, children }: AuthLayoutProps) {
  return (
    <>
      <Head title={title} description={description} />
      <Center h="100dvh" w="100%" p="md">
        <Paper
          shadow="xl"
          p={{ base: 'lg', sm: 'xl' }}
          radius="lg"
          w="100%"
          maw={440}
          withBorder
        >
          <Stack gap="xl">
            <Stack gap={4} ta="center">
              <Title order={2} fw={700}>
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
      </Center>
    </>
  );
}
