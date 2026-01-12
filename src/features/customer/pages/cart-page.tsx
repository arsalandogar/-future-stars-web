import { Box, Container, Text, Title } from '@mantine/core';

import { Head } from '@/components/seo/head';

export function CartPage() {
  return (
    <>
      <Head title="Cart" description="Your shopping cart" />
      <Box py="xl">
        <Container size="xl">
          <Title order={1} c="white" mb="md">
            Shopping Cart
          </Title>
          <Text c="gray.4" size="lg">
            Your cart is empty.
          </Text>
        </Container>
      </Box>
    </>
  );
}
