import { Button, Center, Stack, Text, Title } from '@mantine/core';

export const MainErrorFallback = () => {
  return (
    <Center h="100vh" w="100vw" role="alert">
      <Stack align="center" gap="md">
        <Title order={2} c="red">
          Oops, something went wrong :(
        </Title>
        <Text c="dimmed">An unexpected error occurred</Text>
        <Button
          onClick={() => window.location.assign(window.location.origin)}
          mt="md"
        >
          Refresh
        </Button>
      </Stack>
    </Center>
  );
};
