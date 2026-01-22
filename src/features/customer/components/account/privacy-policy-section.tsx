import { Loader, Text, Title, TypographyStylesProvider } from '@mantine/core';

import { usePublicLegalDocument } from '@/features/legal';
import { sanitizeHtml } from '@/utils/sanitize';

import styles from './account-section.module.css';

export function PrivacyPolicySection() {
  const { data: documentResponse, isLoading } = usePublicLegalDocument({
    variables: 'privacy-policy',
  });
  const document = documentResponse?.data;

  if (isLoading) {
    return (
      <div>
        <div className={styles.header}>
          <div>
            <Title order={2} c="white" fw={800} className={styles.title}>
              Privacy Policy
            </Title>
            <Text component="span" c="dimmed" size="md" display="block">
              How we collect, use, and protect your information
            </Text>
          </div>
        </div>
        <div
          className={styles.card}
          style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}
        >
          <Loader size="lg" />
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div>
        <div className={styles.header}>
          <div>
            <Title order={2} c="white" fw={800} className={styles.title}>
              Privacy Policy
            </Title>
            <Text component="span" c="dimmed" size="md" display="block">
              How we collect, use, and protect your information
            </Text>
          </div>
        </div>
        <div className={styles.card}>
          <Text c="dimmed" ta="center" py="xl">
            This document is not yet available.
          </Text>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className={styles.header}>
        <div>
          <Title order={2} c="white" fw={800} className={styles.title}>
            Privacy Policy
          </Title>
          <Text component="span" c="dimmed" size="md" display="block">
            How we collect, use, and protect your information
          </Text>
        </div>
      </div>
      <div className={styles.card}>
        <TypographyStylesProvider className={styles.legalContent}>
          <div
            // eslint-disable-next-line react-dom/no-dangerously-set-innerhtml
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(document.content) }}
          />
        </TypographyStylesProvider>
      </div>
    </div>
  );
}
