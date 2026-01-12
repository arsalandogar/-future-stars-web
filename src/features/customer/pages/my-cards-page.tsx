import { Box, Container, Text, Title } from '@mantine/core';

import { Head } from '@/components/seo/head';

export function MyCardsPage() {
  return (
    <>
      <Head title="My Cards" description="View and manage your cards" />
      <Box py="xl">
        <Container size="xl">
          <Title order={1} c="white" mb="md">
            My Cards
          </Title>
          <Text c="gray.4" size="lg">
            View and manage your created cards.
          </Text>
        </Container>
      </Box>
    </>
  );
}
