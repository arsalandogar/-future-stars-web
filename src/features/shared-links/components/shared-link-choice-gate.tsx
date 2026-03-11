import { useState } from 'react';
import { Button } from '@mantine/core';

import { env } from '@/config/env';

import { InviteIcon } from './invite-icon';

import styles from './shared-link-choice-gate.module.css';

interface SharedLinkChoiceGateProps {
  code: string;
  onContinueOnWeb: () => void;
}

const APP_FALLBACK_TIMEOUT_MS = 1700;

function buildDeepLinkUrl(code: string): string | null {
  if (!env.APP_DEEPLINK_BASE) return null;

  const base = env.APP_DEEPLINK_BASE.endsWith('/')
    ? env.APP_DEEPLINK_BASE.slice(0, -1)
    : env.APP_DEEPLINK_BASE;

  return `${base}/shared/${code}`;
}

function getStoreUrl(): string | null {
  const ua = navigator.userAgent.toLowerCase();
  const isIOS = /iphone|ipad|ipod/.test(ua);

  if (isIOS) return env.APP_STORE_URL ?? env.PLAY_STORE_URL ?? null;
  return env.PLAY_STORE_URL ?? env.APP_STORE_URL ?? null;
}

export function SharedLinkChoiceGate({
  code,
  onContinueOnWeb,
}: SharedLinkChoiceGateProps) {
  const [showFallbackStore, setShowFallbackStore] = useState(false);
  const deepLinkUrl = buildDeepLinkUrl(code);
  const storeUrl = getStoreUrl();

  const handleOpenInApp = () => {
    if (!deepLinkUrl) {
      onContinueOnWeb();
      return;
    }

    setShowFallbackStore(false);
    window.location.href = deepLinkUrl;

    window.setTimeout(() => {
      if (document.visibilityState === 'visible') {
        setShowFallbackStore(true);
      }
    }, APP_FALLBACK_TIMEOUT_MS);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <div className={styles.badge}>
          <InviteIcon />
        </div>

        <h1 className={styles.title}>Choose how you want to continue</h1>
        <p className={styles.description}>
          Open this invite in the Future Stars app or stay on web and preview it
          here.
        </p>

        <div className={styles.actions}>
          <Button className={styles.openAppButton} onClick={handleOpenInApp}>
            Open in App
          </Button>

          <Button
            variant="default"
            className={styles.webButton}
            onClick={onContinueOnWeb}
          >
            Continue on Web
          </Button>
        </div>

        {showFallbackStore && storeUrl && (
          <p className={styles.fallback}>
            App not installed?{' '}
            <a
              href={storeUrl}
              className={styles.fallbackLink}
              target="_blank"
              rel="noreferrer"
            >
              Download it here
            </a>
            .
          </p>
        )}
      </div>
    </div>
  );
}
