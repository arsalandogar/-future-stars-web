import { Box, Button, Container, Loader, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useNavigate } from '@tanstack/react-router';
import { Plus } from 'lucide-react';
import { MdOutlineShoppingCart } from 'react-icons/md';
import { useState } from 'react';

import { Head } from '@/components/seo/head';
import { ContentPanel } from '@/components/ui/content-panel';
import { EmptyState } from '@/components/ui/empty-state';

import type { Pack } from '@/types';

import { useCartItems } from '../api/get-cart-items';
import { useUserCards } from '../api/get-user-cards';
import { useUserPacks } from '../api/get-user-packs';
import { CartItemsList } from '../components/cart-items-list';
import { PackPreviewModal } from '../components/pack-preview-modal';
import { useCartQuantity } from '../hooks/use-cart-quantity';
import { useCreatePackModalStore } from '../stores/create-pack-modal-store';
import styles from './cart-page.module.css';

export function CartPage() {
  const navigate = useNavigate();
  const { data, isLoading } = useCartItems();
  const { data: cardsData } = useUserCards({ variables: { limit: 1 } });
  const { data: packsData } = useUserPacks({ variables: { limit: 1 } });
  const { openCreate, openEdit } = useCreatePackModalStore();
  const [selectedPack, setSelectedPack] = useState<Pack | null>(null);
  const [packPreviewOpened, { open: openPackPreview, close: closePackPreview }] =
    useDisclosure(false);

  const cartItems = data?.data ?? [];
  const { handleQuantityChange, handleDelete, calculateTotals } =
    useCartQuantity(cartItems);

  const { totalPrice, totalPacks } = calculateTotals();

  const hasCards = (cardsData?.pages[0]?.meta.total ?? 0) > 0;
  const hasPacks = (packsData?.pages[0]?.meta.total ?? 0) > 0;

  const getEmptyStateContent = () => {
    if (hasCards && !hasPacks) {
      return {
        subtitle: 'Tap below to create your first pack',
        actionLabel: 'Create a Pack',
        onAction: openCreate,
      };
    }
    if (hasCards && hasPacks) {
      return {
        subtitle: 'Tap below to add a pack',
        actionLabel: 'Add a Pack',
        onAction: () => navigate({ to: '/my-cards', search: { tab: 'packs' } }),
      };
    }
    return {
      subtitle: 'Tap below to create a card',
      actionLabel: 'Create a Card',
      onAction: () => navigate({ to: '/templates' }),
    };
  };

  const handleAddPack = () => {
    openCreate();
  };

  const handleAddMoreCards = (pack: Pack) => {
    openEdit(pack);
  };

  const handleViewPack = (pack: Pack) => {
    setSelectedPack(pack);
    openPackPreview();
  };

  const handleCheckout = () => {
    void navigate({ to: '/checkout' });
  };

  const isEmpty = cartItems.length === 0 && !isLoading;

  return (
    <>
      <Head title="Cart" description="Your shopping cart" />
      <Box className={styles.pageContainer}>
        <Container size="xl" className={styles.container}>
          <Title order={1} c="white" fw={800} className={styles.title}>
            CART
          </Title>

          <div className={styles.actionsRow}>
            <Button
              variant="transparent"
              c="primaryLight"
              size="md"
              leftSection={<Plus size={18} />}
              onClick={handleAddPack}
              className={styles.addPackButton}
            >
              Add Pack
            </Button>
            <Button
              variant="filled"
              size="md"
              radius="xl"
              leftSection={<MdOutlineShoppingCart size={18} />}
              onClick={handleCheckout}
              disabled={isEmpty}
              className={styles.checkoutButton}
            >
              Checkout
            </Button>
          </div>

          <ContentPanel>
            {isLoading ? (
              <div className={styles.loading}>
                <Loader size="lg" />
              </div>
            ) : isEmpty ? (
              <div className={styles.emptyStateWrapper}>
                <EmptyState
                  shape="circle"
                  icon={<MdOutlineShoppingCart size={72} />}
                  title="Your Cart is Empty!"
                  actionIcon={<Plus size={18} />}
                  {...getEmptyStateContent()}
                />
              </div>
            ) : (
              <CartItemsList
                items={cartItems}
                onQuantityChange={handleQuantityChange}
                onDelete={handleDelete}
                onViewPack={handleViewPack}
                totalPacks={totalPacks}
                totalPrice={totalPrice}
              />
            )}
          </ContentPanel>
        </Container>
      </Box>

      <PackPreviewModal
        pack={selectedPack}
        opened={packPreviewOpened}
        onClose={closePackPreview}
        onEditPack={handleAddMoreCards}
      />
    </>
  );
}
