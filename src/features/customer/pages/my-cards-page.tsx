import { Button, Container, Text, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useNavigate } from '@tanstack/react-router';
import { Images, Plus } from 'lucide-react';
import { MdOutlineShoppingCart } from 'react-icons/md';
import { useState } from 'react';

import { Head } from '@/components/seo/head';
import { EmptyState } from '@/components/ui/empty-state';
import { NavTabs } from '@/components/ui/nav-tabs';

import type { Pack } from '@/types';

import {
  type Card,
  useUserCards,
  USER_CARDS_DEFAULT_LIMIT,
  USER_CARDS_INITIAL_PAGE,
} from '../api/get-user-cards';
import {
  useUserPacks,
  USER_PACKS_DEFAULT_LIMIT,
  USER_PACKS_INITIAL_PAGE,
} from '../api/get-user-packs';
import { CardPreviewModal } from '../components/card-preview-modal';
import { CardsGrid } from '../components/cards-grid';
import { CardsSkeleton } from '../components/cards-skeleton';
import { CreatePackDrawer } from '../components/create-pack-drawer';
import { PacksList } from '../components/packs-list';
import { ViewToggle, type ViewMode } from '../components/view-toggle';
import styles from './my-cards-page.module.css';

const TAB_ITEMS = [
  { label: 'CARDS', value: 'cards' },
  { label: 'PACKS', value: 'packs' },
];

export function MyCardsPage() {
  const [activeTab, setActiveTab] = useState('cards');
  const [selectedCard, setSelectedCard] = useState<Card | undefined>();
  const [modalOpened, { open: openModal, close: closeModal }] =
    useDisclosure(false);
  const [
    createPackDrawerOpened,
    { open: openCreatePackDrawer, close: closeCreatePackDrawer },
  ] = useDisclosure(false);
  const [packsView, setPacksView] = useState<ViewMode>('list');
  const navigate = useNavigate();

  const {
    data: cardsData,
    isLoading: isLoadingCards,
    hasNextPage: hasNextCardsPage,
    isFetchingNextPage: isFetchingNextCardsPage,
    fetchNextPage: fetchNextCardsPage,
  } = useUserCards({
    variables: {
      page: USER_CARDS_INITIAL_PAGE,
      limit: USER_CARDS_DEFAULT_LIMIT,
    },
  });

  const {
    data: packsData,
    isLoading: isLoadingPacks,
    hasNextPage: hasNextPacksPage,
    isFetchingNextPage: isFetchingNextPacksPage,
    fetchNextPage: fetchNextPacksPage,
  } = useUserPacks({
    variables: {
      page: USER_PACKS_INITIAL_PAGE,
      limit: USER_PACKS_DEFAULT_LIMIT,
    },
    enabled: activeTab === 'packs',
  });

  const allCards = cardsData?.pages.flatMap((page) => page.data) ?? [];
  const visibleCards = allCards.filter((card) => !card.hiddenFromGallery);

  const allPacks = packsData?.pages.flatMap((page) => page.data) ?? [];
  const totalPacksCount = packsData?.pages[0]?.meta.total ?? 0;

  const handleCreateCard = () => {
    void navigate({ to: '/create-card' });
  };

  const handleCardClick = (card: Card) => {
    setSelectedCard(card);
    openModal();
  };

  const handleAddPackToCart = (pack: Pack) => {
    // TODO: Implement add to cart functionality
    console.log('Add to cart:', pack.id);
  };

  return (
    <>
      <Head
        title={activeTab === 'cards' ? 'My Cards' : 'My Packs'}
        description={
          activeTab === 'cards'
            ? 'View and manage your cards'
            : 'View and manage your packs'
        }
      />
      <Container size="xl" className={styles.container}>
        <Title order={1} c="white" fw={800} className={styles.title}>
          {activeTab === 'cards' ? 'My Cards' : 'My Packs'}
        </Title>

        <div className={styles.tabsRow}>
          <NavTabs
            items={TAB_ITEMS}
            activeValue={activeTab}
            onChange={setActiveTab}
          />

          {activeTab === 'cards' ? (
            <Button
              variant="filled"
              size="md"
              radius="xl"
              leftSection={<MdOutlineShoppingCart size={18} />}
              onClick={openCreatePackDrawer}
            >
              Buy Cards
            </Button>
          ) : (
            <Button
              size="md"
              radius="xl"
              leftSection={<Plus size={18} />}
              className={styles.createPackButton}
              onClick={openCreatePackDrawer}
            >
              Create Pack
            </Button>
          )}
        </div>

        {activeTab === 'packs' && allPacks.length > 0 && (
          <div className={styles.packsHeader}>
            <Text size="lg" c="white" fw={500}>
              {totalPacksCount} Packs Created
            </Text>
            <ViewToggle view={packsView} onChange={setPacksView} />
          </div>
        )}

        <div
          className={`${styles.contentContainer} ${activeTab === 'packs' && packsView === 'grid' ? styles.transparentBg : ''}`}
        >
          {activeTab === 'cards' && (
            <>
              {isLoadingCards ? (
                <CardsSkeleton />
              ) : visibleCards.length === 0 ? (
                <EmptyState
                  shape="rectangle"
                  icon={<Images size={48} />}
                  title="No Cards Yet!"
                  subtitle="Click below to create your first card"
                  actionLabel="Create Card"
                  actionIcon={<Plus size={18} />}
                  onAction={handleCreateCard}
                />
              ) : (
                <CardsGrid
                  cards={visibleCards}
                  hasNextPage={hasNextCardsPage ?? false}
                  isFetchingNextPage={isFetchingNextCardsPage}
                  fetchNextPage={() => void fetchNextCardsPage()}
                  onCreateCard={handleCreateCard}
                  onCardClick={handleCardClick}
                />
              )}
            </>
          )}

          {activeTab === 'packs' && (
            <>
              {isLoadingPacks ? (
                <CardsSkeleton />
              ) : allPacks.length === 0 ? (
                <EmptyState
                  shape="rectangle"
                  icon={<Images size={48} />}
                  title="No Packs Yet!"
                  subtitle="Tap below to create your first pack"
                  actionLabel="Create a Pack"
                  actionIcon={<Plus size={18} />}
                  onAction={openCreatePackDrawer}
                />
              ) : (
                <PacksList
                  packs={allPacks}
                  view={packsView}
                  hasNextPage={hasNextPacksPage ?? false}
                  isFetchingNextPage={isFetchingNextPacksPage}
                  fetchNextPage={() => void fetchNextPacksPage()}
                  onAddToCart={handleAddPackToCart}
                />
              )}
            </>
          )}
        </div>
      </Container>

      <CardPreviewModal
        card={selectedCard}
        opened={modalOpened}
        onClose={closeModal}
      />

      <CreatePackDrawer
        opened={createPackDrawerOpened}
        onClose={closeCreatePackDrawer}
      />
    </>
  );
}
