import { Button, Center, Stack, Text, Title } from '@mantine/core';
import { useRouter } from '@tanstack/react-router';

export const MainErrorFallback = ({ error }: { error: Error }) => {
  const router = useRouter();

  <Center h="100vh" w="100vw">
    <Stack align="center" gap="md" maw={600}>
      <Title order={1}>Something went wrong</Title>
      <Text c="dimmed">An unexpected error occurred. Please try again.</Text>
      {import.meta.env.DEV && (
        <Stack
          gap="xs"
          p="md"
          bg="red.0"
          style={{ borderRadius: 'var(--mantine-radius-md)' }}
          w="100%"
        >
          <Text c="red.8" fw={600}>
            {error.message}
          </Text>
          {error.stack && (
            <Text
              c="red.7"
              size="xs"
              style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}
            >
              {error.stack}
            </Text>
          )}
        </Stack>
      )}
      <Button onClick={() => void router.invalidate()}>Try Again</Button>
    </Stack>
  </Center>;
};
