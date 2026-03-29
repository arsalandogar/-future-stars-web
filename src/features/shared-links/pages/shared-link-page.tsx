import { useState } from 'react';
import { Button, Loader } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useNavigate } from '@tanstack/react-router';
import { ArrowRight } from 'lucide-react';
import { MdOutlineShoppingCart } from 'react-icons/md';

import { useAuthStore } from '@/stores/auth-store';

import { useSharedLinkAddToCart } from '../api/add-to-cart';
import { useSharedLinkAddToCollection } from '../api/add-to-collection';
import { useSharedLink } from '../api/get-shared-link';
import { InvitationCardPreview } from '../components/invitation-card-preview';
import { InvitationPackPreview } from '../components/invitation-pack-preview';
import { SharedLinkChoiceGate } from '../components/shared-link-choice-gate';
import { SharedLinkError } from '../components/shared-link-error';

import styles from './shared-link-page.module.css';

interface SharedLinkPageProps {
  code: string;
  initialMode?: 'gate' | 'web';
}

const SHARED_LINK_MODE_STORAGE_KEY = 'shared_link_choice_mode';

function isDesktopBrowser() {
  const ua = navigator.userAgent.toLowerCase();
  return !/android|iphone|ipad|ipod|blackberry|iemobile|opera mini/.test(ua);
}

export function SharedLinkPage({ code, initialMode }: SharedLinkPageProps) {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const resolvedInitialMode =
    initialMode === 'web' ||
    isDesktopBrowser() ||
    window.sessionStorage.getItem(SHARED_LINK_MODE_STORAGE_KEY) === 'web'
      ? 'web'
      : 'gate';
  const [viewMode, setViewMode] = useState<'gate' | 'web'>(resolvedInitialMode);

  const {
    data: sharedLink,
    isLoading,
    error,
  } = useSharedLink({
    variables: code,
    enabled: viewMode === 'web',
  });

  const addToCart = useSharedLinkAddToCart();
  const addToCollection = useSharedLinkAddToCollection();
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  const handleContinueOnWeb = () => {
    window.sessionStorage.setItem(SHARED_LINK_MODE_STORAGE_KEY, 'web');
    setViewMode('web');
  };

  if (viewMode === 'gate') {
    return (
      <SharedLinkChoiceGate code={code} onContinueOnWeb={handleContinueOnWeb} />
    );
  }

  const handleSharedLinkError = (
    err: unknown,
    action: 'claim' | 'purchase'
  ) => {
    const status = (err as { response?: { status?: number } }).response?.status;
    if (status === 400) {
      notifications.show({
        title: action === 'claim' ? 'Cannot claim' : 'Cannot purchase',
        message:
          action === 'claim'
            ? "You can't claim your own card."
            : "You can't buy your own card.",
        color: 'yellow',
      });
    } else {
      notifications.show({
        title: 'Error',
        message:
          action === 'claim'
            ? 'Failed to add to collection. Please try again.'
            : 'Failed to add to cart. Please try again.',
        color: 'red',
      });
    }
  };

  const handleAddToCollection = () => {
    if (!isAuthenticated || user?.isGuest) {
      window.location.href = `/login?redirectTo=${encodeURIComponent(`/shared/${code}`)}`;
      return;
    }

    addToCollection.mutate(code, {
      onSuccess: () => {
        notifications.show({
          title: 'Added to collection',
          message:
            sharedLink?.shareableType === 'card'
              ? 'The card has been added to your collection!'
              : 'The pack has been added to your collection!',
          color: 'green',
        });
        void navigate({
          to: '/my-cards',
          search: {
            tab: sharedLink?.shareableType === 'card' ? 'cards' : 'packs',
          },
        });
      },
      onError: (err) => handleSharedLinkError(err, 'claim'),
    });
  };

  const handleAddToCart = () => {
    addToCart.mutate(code, {
      onSuccess: () => {
        notifications.show({
          title: 'Added to cart',
          message:
            sharedLink?.shareableType === 'card'
              ? 'The card has been added to your cart!'
              : 'The pack has been added to your cart!',
          color: 'green',
        });
        void navigate({ to: '/cart' });
      },
      onError: (err) => handleSharedLinkError(err, 'purchase'),
    });
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <Loader size="lg" />
      </div>
    );
  }

  if (error) {
    const status = (error as { response?: { status?: number } }).response
      ?.status;
    if (status === 404) return <SharedLinkError type="not-found" />;
    if (status === 410) return <SharedLinkError type="expired" />;
    return <SharedLinkError type="generic" />;
  }

  if (!sharedLink) return <SharedLinkError type="not-found" />;

  const isCard = sharedLink.shareableType === 'card';
  const isPack = !isCard;
  const sharerName = sharedLink.user
    ? `${sharedLink.user.firstName} ${sharedLink.user.lastName.charAt(0)}.`
    : 'Someone';
  const itemLabel = isCard ? 'card' : 'pack';

  const totalCards = sharedLink.pack?.packCards.length ?? 0;
  const handlePrev = () => setCurrentCardIndex((i) => Math.max(0, i - 1));
  const handleNext = () =>
    setCurrentCardIndex((i) =>
      totalCards > 0 ? Math.min(totalCards - 1, i + 1) : i
    );

  const hasCounter = isPack && totalCards > 0;

  return (
    <div className={styles.page}>
      <section className={styles.stage}>
        <h1 className={styles.headline}>
          {sharerName} shared a {itemLabel} with you!
        </h1>

        <div className={styles.previewWrap}>
          {isCard && sharedLink.card && (
            <InvitationCardPreview card={sharedLink.card} />
          )}
          {isPack && sharedLink.pack && (
            <InvitationPackPreview
              pack={sharedLink.pack}
              currentCardIndex={currentCardIndex}
              onPrev={handlePrev}
              onNext={handleNext}
            />
          )}
        </div>
      </section>

      <section
        className={`${styles.actionBand} ${hasCounter ? styles.actionBandWithCounter : ''}`}
      >
        {hasCounter && (
          <div className={styles.counterPill}>
            Card {currentCardIndex + 1} of {totalCards}
          </div>
        )}

        {sharedLink.message && (
          <p className={styles.message}>{sharedLink.message}</p>
        )}

        <div className={styles.actions}>
          <Button
            variant="outline"
            className={styles.collectionButton}
            rightSection={<ArrowRight size={19} />}
            onClick={handleAddToCollection}
            loading={addToCollection.isPending}
          >
            Add To Collection
          </Button>

          <Button
            variant="filled"
            className={styles.buyButton}
            leftSection={<MdOutlineShoppingCart size={22} />}
            onClick={handleAddToCart}
            loading={addToCart.isPending}
          >
            Buy This {itemLabel}
          </Button>
        </div>
      </section>
    </div>
  );
}
