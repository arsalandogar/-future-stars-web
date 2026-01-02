import { Button, Center, Stack, Text, Title } from '@mantine/core';

import { Head } from '@/components/seo/head';
import { useLogout } from '@/hooks/use-logout';
import { useAuthStore } from '@/stores/auth-store';

export function HomePage() {
  const { user } = useAuthStore();
  const logout = useLogout();

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
            <Button onClick={() => void logout()} variant="outline" color="red">
              Logout
            </Button>
          </Stack>
        </Stack>
      </Center>
    </>
  );
}
