import { createFileRoute } from '@tanstack/react-router';
import { Button, Center, Stack, Text, Title } from '@mantine/core';
import { Head } from '@/components/seo/head';
import { useAuthStore } from '@/features/auth';

export const Route = createFileRoute('/_authenticated/')({
  component: HomeComponent,
});

function HomeComponent() {
  const { user, clearAuth } = useAuthStore();

  return (
    <>
      <Head
        title="Home"
        description="Welcome to Future Stars - Discover and nurture young talent"
      />
      <Center h="100vh" w="100vw">
        <Stack align="center" gap="lg">
          <Title order={1}>Future Stars</Title>
          <Text size="xl" c="dimmed">
            Welcome back, {user?.firstName}!
          </Text>
          <Stack gap="sm" mt="md">
            <Button onClick={() => clearAuth()} variant="outline" color="red">
              Logout
            </Button>
          </Stack>
        </Stack>
      </Center>
    </>
  );
}
