import { useEffect, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Carousel } from '@mantine/carousel';
import type { EmblaCarouselType } from 'embla-carousel';
import {
  ActionIcon,
  AspectRatio,
  Button,
  Drawer,
  Image,
  Modal,
  Tabs,
  Text,
  useMantineTheme,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';

import type {
  ActiveTagFilter,
  BrowseTemplate,
  TagWithTemplates,
} from '../types';

const ALL_TAGS = 'all' as const;

import styles from './template-preview-modal.module.css';

interface TemplatePreviewModalProps {
  template: BrowseTemplate | null;
  allTags: TagWithTemplates[];
  opened: boolean;
  onClose: () => void;
  onTemplateChange?: (templateId: number) => void;
}

function getUniqueTemplates(
  allTags: TagWithTemplates[],
  activeTagId: ActiveTagFilter
): BrowseTemplate[] {
  const tagsToUse =
    activeTagId === ALL_TAGS
      ? allTags
      : allTags.filter((tag) => tag.id === activeTagId);

  const seen = new Set<number>();
  return tagsToUse.flatMap((tag) =>
    tag.templates.filter((template) => {
      if (seen.has(template.id)) return false;
      seen.add(template.id);
      return true;
    })
  );
}

export function TemplatePreviewModal({
  template,
  allTags,
  opened,
  onClose,
  onTemplateChange,
}: TemplatePreviewModalProps) {
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);
  const [activeTagId, setActiveTagId] = useState<ActiveTagFilter>(ALL_TAGS);
  const [embla, setEmbla] = useState<EmblaCarouselType | null>(null);

  const carouselTemplates = getUniqueTemplates(allTags, activeTagId);

  const selectedTemplate = template;

  const currentIndex = selectedTemplate
    ? carouselTemplates.findIndex((tpl) => tpl.id === selectedTemplate.id)
    : 0;

  // Scroll carousel to match selected template
  useEffect(() => {
    if (!embla || currentIndex < 0) return;
    const indicesInView = embla.slidesInView();
    if (currentIndex >= 0 && indicesInView.includes(currentIndex)) {
      return;
    }
    const emblaIndex = embla.selectedScrollSnap();
    if (emblaIndex !== currentIndex) {
      embla.scrollTo(currentIndex, false);
    }
  }, [embla, currentIndex]);

  function handleThumbnailClick(tpl: BrowseTemplate): void {
    onTemplateChange?.(tpl.id);
  }

  function handlePrev(): void {
    const prevId = carouselTemplates[Math.max(0, currentIndex - 1)].id;
    onTemplateChange?.(prevId);
    embla?.scrollPrev();
  }

  function handleNext(): void {
    const nextId =
      carouselTemplates[
        Math.min(carouselTemplates.length - 1, currentIndex + 1)
      ].id;
    onTemplateChange?.(nextId);
    embla?.scrollNext();
  }

  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < carouselTemplates.length - 1;

  if (!selectedTemplate) return null;

  const content = (
    <>
      {/* Custom Header */}
      <div className={styles.header}>
        <ActionIcon
          variant="subtle"
          color="gray"
          size="lg"
          onClick={onClose}
          aria-label="Close modal"
        >
          <X size={20} />
        </ActionIcon>

        <Text className={styles.title}>TEMPLATE PREVIEW</Text>

        <Button
          component={Link}
          to="/create-card"
          size="sm"
          leftSection={<Plus size={16} />}
        >
          Create Card
        </Button>
      </div>

      {/* Preview Section */}
      <div className={styles.previewSection}>
        <div className={styles.previewCard}>
          <AspectRatio ratio={3 / 4}>
            <Image
              src={selectedTemplate.templateImage}
              alt={`${selectedTemplate.label} front`}
            />
          </AspectRatio>
        </div>

        {selectedTemplate.backTemplate && (
          <div className={styles.previewCard}>
            <AspectRatio ratio={3 / 4}>
              <Image
                src={selectedTemplate.backTemplate.templateImage}
                alt={`${selectedTemplate.label} back`}
              />
            </AspectRatio>
          </div>
        )}
      </div>

      {/* Category Tabs */}
      <div className={styles.tabsSection}>
        <Tabs
          value={activeTagId === ALL_TAGS ? ALL_TAGS : activeTagId.toString()}
          onChange={(value) => {
            if (!value || value === ALL_TAGS) {
              setActiveTagId(ALL_TAGS);
            } else {
              setActiveTagId(Number(value));
            }
          }}
          variant="unstyled"
        >
          <Tabs.List>
            <Tabs.Tab value={ALL_TAGS}>All</Tabs.Tab>
            {allTags.map((tag) => (
              <Tabs.Tab key={tag.id} value={tag.id.toString()}>
                {tag.label}
              </Tabs.Tab>
            ))}
          </Tabs.List>
        </Tabs>
      </div>

      {/* Template Carousel */}
      <div className={styles.carouselSection}>
        <ActionIcon
          className={styles.arrowLeft}
          variant="filled"
          size="lg"
          onClick={handlePrev}
          disabled={!canGoPrev}
          aria-label="Previous template"
        >
          <ChevronLeft size={20} />
        </ActionIcon>

        <Carousel
          getEmblaApi={setEmbla}
          slideSize={isMobile ? '33.333%' : '20%'}
          slideGap="sm"
          withControls={false}
          classNames={{ root: styles.carousel }}
        >
          {carouselTemplates.map((tpl) => {
            const isSelected = tpl.id === selectedTemplate.id;
            return (
              <Carousel.Slide key={tpl.id}>
                <button
                  type="button"
                  className={styles.thumbnail}
                  data-selected={isSelected}
                  onClick={() => handleThumbnailClick(tpl)}
                >
                  <img
                    src={tpl.templateImageMedium}
                    alt={tpl.label}
                    loading="lazy"
                    decoding="async"
                  />
                </button>
              </Carousel.Slide>
            );
          })}
        </Carousel>

        <ActionIcon
          className={styles.arrowRight}
          variant="filled"
          size="lg"
          onClick={handleNext}
          disabled={!canGoNext}
          aria-label="Next template"
        >
          <ChevronRight size={20} />
        </ActionIcon>
      </div>
    </>
  );

  if (isMobile) {
    return (
      <Drawer
        opened={opened}
        onClose={onClose}
        position="bottom"
        withCloseButton={false}
        classNames={{ content: styles.drawer }}
      >
        {content}
      </Drawer>
    );
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="xl"
      centered
      withCloseButton={false}
      classNames={{ root: styles.modal }}
    >
      {content}
    </Modal>
  );
}
