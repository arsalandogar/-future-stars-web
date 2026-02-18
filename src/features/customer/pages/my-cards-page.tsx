import { useCallback, useState } from 'react';
import { Button, Container, Text, Title } from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { getRouteApi, useNavigate } from '@tanstack/react-router';
import { Images, Plus } from 'lucide-react';
import { MdOutlineShoppingCart } from 'react-icons/md';

import { Head } from '@/components/seo/head';
import { ContentPanel } from '@/components/ui/content-panel';
import { ContentTabs } from '@/components/ui/content-tabs';
import { EmptyState } from '@/components/ui/empty-state';

import type { Pack } from '@/types';
import { MAX_PACK_CARDS } from '@/types';

import { useAddCartItem } from '../api/add-cart-item';
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
import { PackPreviewModal } from '../components/pack-preview-modal';
import { PacksList } from '../components/packs-list';
import { ViewToggle, type ViewMode } from '../components/view-toggle';
import { useAddedToCartPopupStore } from '../stores/added-to-cart-popup-store';
import { useCreatePackModalStore } from '../stores/create-pack-modal-store';
import { usePackAutofillModalStore } from '../stores/pack-autofill-modal-store';
import { getTotalCards } from '../utils/get-total-cards';
import styles from './my-cards-page.module.css';

const routeApi = getRouteApi('/_authenticated/_customer/my-cards');

const TAB_ITEMS = [
  { label: 'CARDS', value: 'cards' },
  { label: 'PACKS', value: 'packs' },
];

interface CardsTabContentProps {
  isLoading: boolean;
  cards: Card[];
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onFetchNextPage: () => void;
  onCreateCard: () => void;
  onCardClick: (card: Card) => void;
}

function CardsTabContent({
  isLoading,
  cards,
  hasNextPage,
  isFetchingNextPage,
  onFetchNextPage,
  onCreateCard,
  onCardClick,
}: CardsTabContentProps) {
  if (isLoading) return <CardsSkeleton />;

  if (cards.length === 0) {
    return (
      <div className={styles.emptyStateWrapper}>
        <EmptyState
          shape="rectangle"
          icon={<Images size={48} />}
          title="No Cards Yet!"
          subtitle="Click below to create your first card"
          actionLabel="Create Card"
          actionIcon={<Plus size={18} />}
          onAction={onCreateCard}
        />
      </div>
    );
  }

  return (
    <CardsGrid
      cards={cards}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      fetchNextPage={onFetchNextPage}
      onCreateCard={onCreateCard}
      onCardClick={onCardClick}
    />
  );
}

interface PacksTabContentProps {
  isLoading: boolean;
  packs: Pack[];
  view: ViewMode;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onFetchNextPage: () => void;
  onAddToCart: (pack: Pack) => void;
  onPreview: (pack: Pack) => void;
  onEdit: (pack: Pack) => void;
  onCopy: (pack: Pack) => void;
  onCreate: () => void;
}

function PacksTabContent({
  isLoading,
  packs,
  view,
  hasNextPage,
  isFetchingNextPage,
  onFetchNextPage,
  onAddToCart,
  onPreview,
  onEdit,
  onCopy,
  onCreate,
}: PacksTabContentProps) {
  if (isLoading) return <CardsSkeleton />;

  if (packs.length === 0) {
    return (
      <div className={styles.emptyStateWrapper}>
        <EmptyState
          shape="rectangle"
          icon={<Images size={48} />}
          title="No Packs Yet!"
          subtitle="Tap below to create your first pack"
          actionLabel="Create a Pack"
          actionIcon={<Plus size={18} />}
          onAction={onCreate}
        />
      </div>
    );
  }

  return (
    <PacksList
      packs={packs}
      view={view}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      fetchNextPage={onFetchNextPage}
      onAddToCart={onAddToCart}
      onPreview={onPreview}
      onEdit={onEdit}
      onCopy={onCopy}
    />
  );
}

export function MyCardsPage() {
  const { tab: activeTab } = routeApi.useSearch();
  const [selectedCardIndex, setSelectedCardIndex] = useState<number>(0);
  const [selectedPack, setSelectedPack] = useState<Pack | undefined>();
  const [modalOpened, { open: openModal, close: closeModal }] =
    useDisclosure(false);
  const [
    packPreviewOpened,
    { open: openPackPreview, close: closePackPreview },
  ] = useDisclosure(false);
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 576px)');
  const [packsView, setPacksView] = useState<ViewMode>('list');

  const { openCreate, openEdit, openCopy, openBuy } = useCreatePackModalStore();
  const openAddedToCartPopup = useAddedToCartPopupStore((s) => s.open);
  const openAutofillModal = usePackAutofillModalStore((s) => s.open);
  const addCartItem = useAddCartItem();

  const setActiveTab = (tab: string) => {
    void navigate({
      to: '/my-cards',
      search: { tab: tab as 'cards' | 'packs' },
    });
  };

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
    const index = visibleCards.findIndex((c) => c.id === card.id);
    setSelectedCardIndex(index >= 0 ? index : 0);
    openModal();
  };

  const handleAddPackToCart = (pack: Pack) => {
    const totalCards = getTotalCards(pack.packCards);

    if (totalCards < MAX_PACK_CARDS) {
      // Pack is not full - show autofill modal
      openAutofillModal(pack, { needsAddToCart: true });
      return;
    }

    // Pack is full - add directly to cart
    addCartItem.mutate(
      { packId: pack.id, quantity: 1 },
      {
        onSuccess: (response) => {
          openAddedToCartPopup(response.data);
        },
      }
    );
  };

  const handlePackPreview = (pack: Pack) => {
    setSelectedPack(pack);
    openPackPreview();
  };

  const handleEditPack = useCallback(
    (pack: Pack) => {
      openEdit(pack);
    },
    [openEdit]
  );

  const handleCopyPack = useCallback(
    (pack: Pack) => {
      openCopy(pack);
    },
    [openCopy]
  );

  const handleBuyCard = useCallback(
    (cardId: number, quantity: number) => {
      closeModal();
      openBuy(cardId, quantity);
    },
    [closeModal, openBuy]
  );

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
          <ContentTabs
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
              onClick={openCreate}
            >
              Buy Cards
            </Button>
          ) : (
            <Button
              size="md"
              radius="xl"
              leftSection={<Plus size={18} />}
              className={styles.createPackButton}
              onClick={openCreate}
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
            {!isMobile && (
              <ViewToggle view={packsView} onChange={setPacksView} />
            )}
          </div>
        )}

        <ContentPanel
          className={
            activeTab === 'packs' && packsView === 'grid'
              ? styles.transparentBg
              : ''
          }
        >
          <div key={activeTab} className={styles.tabContent}>
            {activeTab === 'cards' && (
              <CardsTabContent
                isLoading={isLoadingCards}
                cards={visibleCards}
                hasNextPage={hasNextCardsPage ?? false}
                isFetchingNextPage={isFetchingNextCardsPage}
                onFetchNextPage={() => void fetchNextCardsPage()}
                onCreateCard={handleCreateCard}
                onCardClick={handleCardClick}
              />
            )}

            {activeTab === 'packs' && (
              <PacksTabContent
                isLoading={isLoadingPacks}
                packs={allPacks}
                view={packsView}
                hasNextPage={hasNextPacksPage ?? false}
                isFetchingNextPage={isFetchingNextPacksPage}
                onFetchNextPage={() => void fetchNextPacksPage()}
                onAddToCart={handleAddPackToCart}
                onPreview={handlePackPreview}
                onEdit={handleEditPack}
                onCopy={handleCopyPack}
                onCreate={openCreate}
              />
            )}
          </div>
        </ContentPanel>
      </Container>

      {modalOpened && (
        <CardPreviewModal
          cards={visibleCards}
          initialIndex={selectedCardIndex}
          opened={modalOpened}
          onClose={closeModal}
          onBuyCard={handleBuyCard}
          hasNextPage={hasNextCardsPage}
          onLoadMore={() => void fetchNextCardsPage()}
        />
      )}

      <PackPreviewModal
        pack={selectedPack ?? null}
        opened={packPreviewOpened}
        onClose={closePackPreview}
        onEditPack={handleEditPack}
      />
    </>
  );
}
