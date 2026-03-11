import { Container } from '@mantine/core';
import { useSuspenseQuery } from '@tanstack/react-query';

import { Head } from '@/components/seo/head';

import { cardQuery } from '../api/get-card';
import { CardSuccess } from '../components/card-success';

import styles from './card-page.module.css';

interface CardPageProps {
  cardId: number;
}

export function CardPage({ cardId }: CardPageProps) {
  const { data: card } = useSuspenseQuery(cardQuery.getOptions(cardId));

  return (
    <>
      <Head title="Card Created" description="Your card has been created" />
      <Container size="xl" className={styles.wrapper}>
        <CardSuccess card={card} />
      </Container>
    </>
  );
}
