import { Box, Container, Text, Title } from '@mantine/core';

import { Head } from '@/components/seo/head';

export function HomePage() {
  return (
    <>
      <Head title="Home" description="Create professional-grade sports cards" />
      <Box py="xl">
        <Container size="xl">
          <Title order={1} c="white" mb="md">
            COLLECT YOUR MEMORIES
          </Title>
          <Text c="gray.4" size="lg">
            Create professional-grade sports cards for the next generation of
            athletes.
          </Text>
        </Container>
      </Box>
    </>
  );
}
