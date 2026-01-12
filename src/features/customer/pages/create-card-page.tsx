import { Box, Container, Text, Title } from '@mantine/core';

import { Head } from '@/components/seo/head';

export function CreateCardPage() {
  return (
    <>
      <Head title="Create Card" description="Create your custom sports card" />
      <Box py="xl">
        <Container size="xl">
          <Title order={1} c="white" mb="md">
            Create a Card
          </Title>
          <Text c="gray.4" size="lg">
            Start creating your custom sports card.
          </Text>
        </Container>
      </Box>
    </>
  );
}
