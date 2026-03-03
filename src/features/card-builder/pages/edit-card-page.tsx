import { Container, Text, Title } from '@mantine/core';

import { Head } from '@/components/seo/head';

interface EditCardPageProps {
  cardId: number;
}

export function EditCardPage({ cardId }: EditCardPageProps) {
  return (
    <>
      <Head title="Edit Card" description="Edit an existing card" />
      <Container size="xl" py="xl">
        <Title order={2} c="white" mb="sm">
          Edit Card
        </Title>
        <Text c="dimmed">Card #{cardId}</Text>
        <Text c="dimmed" mt="md">
          TODO: Initialize the editor from an existing card payload and editable
          state.
        </Text>
      </Container>
    </>
  );
}
