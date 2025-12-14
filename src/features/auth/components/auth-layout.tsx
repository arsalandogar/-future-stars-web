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
      <Center mih="100vh" p="md">
        <Paper shadow="md" p="xl" radius="md" w="100%" maw={420}>
          <Stack gap="lg">
            <Stack gap="xs" ta="center">
              <Title order={2}>{title}</Title>
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
