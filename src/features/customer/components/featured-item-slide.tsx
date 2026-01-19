import { Link } from '@tanstack/react-router';
import { Button, Image, Text, Title } from '@mantine/core';

import styles from './featured-carousel.module.css';

interface FeaturedItemSlideProps {
  title: string;
  description?: string;
  ctaText?: string;
  imageUrl?: string;
}

function formatTitleWithHighlight(title: string) {
  const words = title.split(' ');
  if (words.length <= 1) {
    return <span className={styles.highlightedWord}>{title}</span>;
  }

  const lastWord = words.pop();
  const restOfTitle = words.join(' ');

  return (
    <>
      {restOfTitle} <span className={styles.highlightedWord}>{lastWord}</span>
    </>
  );
}

export function FeaturedItemSlide({
  title,
  description,
  ctaText,
  imageUrl,
}: FeaturedItemSlideProps) {
  return (
    <div className={styles.slide}>
      <Title
        order={1}
        c="white"
        fw={800}
        ta="center"
        tt="uppercase"
        className={styles.title}
      >
        {formatTitleWithHighlight(title)}
      </Title>

      <div className={styles.imageContainer}>
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fit="contain"
            radius="md"
            className={styles.image}
          />
        ) : (
          <div className={styles.imagePlaceholder} />
        )}
      </div>

      <Button
        component={Link}
        to="/create-card"
        size="lg"
        radius="xl"
        className={styles.ctaButton}
      >
        {ctaText || 'Create a Card'}
      </Button>

      {description && (
        <Text
          c="white"
          size="2xl"
          ta="center"
          maw={700}
          className={styles.description}
        >
          {description}
        </Text>
      )}
    </div>
  );
}
