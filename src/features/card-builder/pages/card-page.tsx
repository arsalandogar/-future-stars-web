import { Container } from '@mantine/core';

import { Head } from '@/components/seo/head';

import { useCard } from '../api/get-card';
import { CardSuccess } from '../components/card-success';

import styles from './card-page.module.css';

interface CardPageProps {
  cardId: number;
}

export function CardPage({ cardId }: CardPageProps) {
  const { data: card } = useCard({ variables: cardId });

  if (!card) return null;

  return (
    <>
      <Head title="Card Created" description="Your card has been created" />
      <Container size="xl" className={styles.wrapper}>
        <CardSuccess card={card} />
      </Container>
    </>
  );
}
