import { isAxiosError } from 'axios';
import { Button, Center, Stack, Text, Title } from '@mantine/core';
import { useRouter } from '@tanstack/react-router';

function getErrorMessage(error: Error): string {
  if (isAxiosError<{ errors?: Array<{ message: string }> }>(error)) {
    const status = error.response?.status;
    const apiMessage = error.response?.data?.errors?.[0]?.message;

    if (status === 404)
      return apiMessage ?? 'The requested resource was not found.';
    if (status === 403)
      return 'You do not have permission to access this resource.';
    if (apiMessage) return apiMessage;
  }

  return 'An unexpected error occurred. Please try again.';
}

export const MainErrorFallback = ({ error }: { error: Error }) => {
  const router = useRouter();
  const message = getErrorMessage(error);

  return (
    <Center h="100dvh" w="100%">
      <Stack align="center" gap="md" maw={600}>
        <Title order={1}>Something went wrong</Title>
        <Text c="dimmed">{message}</Text>
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
    </Center>
  );
};
