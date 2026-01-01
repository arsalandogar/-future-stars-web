import { Button, Stack, Text, Title } from '@mantine/core';
import { useRouter } from '@tanstack/react-router';

export function NotFound() {
  const router = useRouter();

  return (
    <Stack align="center" justify="center" gap="md" h="100%">
      <Title order={1}>404</Title>
      <Text size="xl">Page Not Found</Text>
      <Text c="dimmed">The page you are looking for does not exist.</Text>
      <Button onClick={() => router.history.back()}>Go Back</Button>
    </Stack>
  );
}
