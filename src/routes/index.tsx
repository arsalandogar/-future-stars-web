import { createFileRoute } from '@tanstack/react-router';
import { Button, Center, Stack, Text, Title } from '@mantine/core';
import { Link } from '@tanstack/react-router';
import { Head } from '@/components/seo/head';

export const Route = createFileRoute('/')({
  component: HomeComponent,
});

function HomeComponent() {
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
            Discover and nurture young talent
          </Text>
          <Stack gap="sm" mt="md">
            <Button component={Link} to="/auth/login" size="lg">
              Get Started
            </Button>
          </Stack>
        </Stack>
      </Center>
    </>
  );
}
