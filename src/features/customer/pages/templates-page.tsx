import { Box, Container, Text, Title } from '@mantine/core';

import { Head } from '@/components/seo/head';

export function TemplatesPage() {
  return (
    <>
      <Head title="Templates" description="Browse our card templates" />
      <Box py="xl">
        <Container size="xl">
          <Title order={1} c="white" mb="md">
            Templates
          </Title>
          <Text c="gray.4" size="lg">
            Browse our collection of card templates.
          </Text>
        </Container>
      </Box>
    </>
  );
}
