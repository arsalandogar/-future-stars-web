import { useEffect, useMemo, useState } from 'react';
import { Carousel } from '@mantine/carousel';
import type { EmblaCarouselType } from 'embla-carousel';
import {
  ActionIcon,
  AspectRatio,
  Drawer,
  Image,
  Modal,
  Tabs,
  Text,
  useMantineTheme,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';

import { ButtonLink } from '@/components/ui/button-link';
import type { Tag } from '@/types';

import type { BrowseTemplate } from '../types';
import styles from './template-preview-modal.module.css';

type ActiveTagFilter = 'all' | number;
const ALL_TAGS = 'all' as const;

interface TemplatePreviewModalProps {
  template: BrowseTemplate | null;
  tags: Tag[];
  templates: BrowseTemplate[];
  opened: boolean;
  onClose: () => void;
  onTemplateChange?: (templateId: number) => void;
}

function getUniqueTemplates(
  templates: BrowseTemplate[],
  activeTagId: ActiveTagFilter
): BrowseTemplate[] {
  if (activeTagId === ALL_TAGS) {
    return templates;
  }

  return templates.filter((template) =>
    template.tags?.some((tag) => tag.id === activeTagId)
  );
}

export function TemplatePreviewModal({
  template,
  tags,
  templates,
  opened,
  onClose,
  onTemplateChange,
}: TemplatePreviewModalProps) {
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);
  const [activeTagId, setActiveTagId] = useState<ActiveTagFilter>(ALL_TAGS);
  const [embla, setEmbla] = useState<EmblaCarouselType | null>(null);

  const carouselTemplates = useMemo(
    () => getUniqueTemplates(templates, activeTagId),
    [templates, activeTagId]
  );

  const currentIndex = template
    ? carouselTemplates.findIndex((tpl) => tpl.id === template.id)
    : 0;

  // Scroll carousel to match selected template
  useEffect(() => {
    if (!embla || currentIndex < 0) return;
    if (embla.slidesInView().includes(currentIndex)) return;
    embla.scrollTo(currentIndex, false);
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

  if (!template) return null;

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

        <ButtonLink
          to="/create-card"
          search={{ templateId: template.id }}
          size="sm"
          leftSection={<Plus size={16} />}
        >
          Create Card
        </ButtonLink>
      </div>

      {/* Preview Section */}
      <div className={styles.previewSection}>
        <div className={styles.previewCard}>
          <AspectRatio ratio={3 / 4}>
            <Image
              src={template.templateImage}
              alt={`${template.label} front`}
            />
          </AspectRatio>
        </div>

        {template.backTemplate && (
          <div className={styles.previewCard}>
            <AspectRatio ratio={3 / 4}>
              <Image
                src={template.backTemplate.templateImage}
                alt={`${template.label} back`}
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
            {tags.map((tag) => (
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
            const isSelected = tpl.id === template.id;
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
      overlayProps={{ backgroundOpacity: 1 }}
      classNames={{
        overlay: styles.overlay,
        content: styles.content,
        body: styles.body,
      }}
    >
      {content}
    </Modal>
  );
}
