import { Box, Container, Text, Title } from '@mantine/core';

import { Head } from '@/components/seo/head';

export function AccountPage() {
  return (
    <>
      <Head title="Account" description="Manage your account settings" />
      <Box py="xl">
        <Container size="xl">
          <Title order={1} c="white" mb="md">
            Account
          </Title>
          <Text c="gray.4" size="lg">
            Manage your account settings.
          </Text>
        </Container>
      </Box>
    </>
  );
}
