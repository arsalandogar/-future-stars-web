import {
  ActionIcon,
  AspectRatio,
  Group,
  Image,
  Loader,
  SimpleGrid,
  Text,
} from '@mantine/core';
import {
  ChevronLeft,
  ChevronRight,
  GalleryHorizontalEnd,
  Image as ImageIcon,
} from 'lucide-react';

import { ContentTabs } from '@/components/ui/content-tabs';
import type { ColorPair } from '@/features/color-palettes';
import { useTemplates, type TemplateSide } from '@/features/templates';

import { ColoredTemplateThumbnail } from './colored-template-thumbnail';
import styles from './template-preview-grid.module.css';

const SIDE_TABS = [
  { label: 'All', value: 'all' },
  { label: 'FRONT', value: 'front' },
  { label: 'BACK', value: 'back' },
];

type TemplateView = 'grid' | 'single';

interface TemplatePreviewGridProps {
  side: 'all' | TemplateSide;
  onSideChange: (side: 'all' | TemplateSide) => void;
  /** Color pairs from the palette (bg + fg per area). */
  colorPairs: ColorPair[];
  /** Current view mode: grid or single. */
  view: TemplateView;
  onViewChange: (view: TemplateView) => void;
  /** Index of the currently displayed template in single view. */
  templateIndex: number;
  onTemplateIndexChange: (index: number) => void;
}

export function TemplatePreviewGrid({
  side,
  onSideChange,
  colorPairs,
  view,
  onViewChange,
  templateIndex,
  onTemplateIndexChange,
}: TemplatePreviewGridProps) {
  const { data, isLoading } = useTemplates({
    variables: {
      limit: 100,
      side: side === 'all' ? undefined : side,
    },
  });

  // Only show annotated templates for now
  const templates = (data?.data ?? []).filter((t) => [5, 9, 42].includes(t.id));
  const hasColors = colorPairs.length > 0;

  // Clamp index to valid range
  const clampedIndex =
    templates.length > 0 ? Math.min(templateIndex, templates.length - 1) : 0;
  const currentTemplate = templates[clampedIndex];

  const handlePrev = () => {
    if (clampedIndex > 0) {
      onTemplateIndexChange(clampedIndex - 1);
    }
  };

  const handleNext = () => {
    if (clampedIndex < templates.length - 1) {
      onTemplateIndexChange(clampedIndex + 1);
    }
  };

  return (
    <div className="flex flex-col gap-md" style={{ minHeight: 0 }}>
      <div className={styles.header}>
        <ContentTabs
          items={SIDE_TABS}
          activeValue={side}
          onChange={(value) => onSideChange(value as 'all' | TemplateSide)}
          size="sm"
          gap="var(--mantine-spacing-md)"
        />
        <Group gap="xs">
          <ActionIcon
            variant={view === 'single' ? 'filled' : 'subtle'}
            size="sm"
            color={view === 'single' ? 'primary' : 'gray'}
            title="Single view"
            onClick={() => onViewChange('single')}
          >
            <ImageIcon size={16} />
          </ActionIcon>
          <ActionIcon
            variant={view === 'grid' ? 'filled' : 'subtle'}
            size="sm"
            color={view === 'grid' ? 'primary' : 'gray'}
            title="Grid view"
            onClick={() => onViewChange('grid')}
          >
            <GalleryHorizontalEnd size={16} />
          </ActionIcon>
        </Group>
      </div>

      <div className={styles.grid}>
        {isLoading ? (
          <div className="flex items-center justify-center py-xl">
            <Loader size="sm" />
          </div>
        ) : templates.length === 0 ? (
          <Text c="dimmed" size="sm" ta="center" py="lg">
            No templates found
          </Text>
        ) : view === 'grid' ? (
          <SimpleGrid cols={3} spacing="sm">
            {templates.map((template) => (
              <AspectRatio key={template.id} ratio={2.5 / 3.5}>
                <div className={styles.thumbnail}>
                  {hasColors ? (
                    <ColoredTemplateThumbnail
                      templateId={template.id}
                      templateName={template.name}
                      colorPairs={colorPairs}
                    />
                  ) : template.templateImageMedium ? (
                    <Image
                      src={template.templateImageMedium}
                      alt={template.name}
                      className={styles.thumbnailImage}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Text c="dimmed" size="xs">
                        No image
                      </Text>
                    </div>
                  )}
                </div>
              </AspectRatio>
            ))}
          </SimpleGrid>
        ) : (
          <div className={styles.singleView}>
            <div className={styles.singleCardWrapper}>
              <div className={`${styles.singleCard} ${styles.thumbnail}`}>
                {currentTemplate && hasColors ? (
                  <ColoredTemplateThumbnail
                    key={currentTemplate.id}
                    templateId={currentTemplate.id}
                    templateName={currentTemplate.name}
                    colorPairs={colorPairs}
                  />
                ) : currentTemplate?.templateImageMedium ? (
                  <Image
                    src={currentTemplate.templateImageMedium}
                    alt={currentTemplate.name}
                    className={styles.thumbnailImage}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Text c="dimmed" size="xs">
                      No image
                    </Text>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.singleNav}>
              <ActionIcon
                variant="subtle"
                color="gray"
                size="lg"
                onClick={handlePrev}
                disabled={clampedIndex === 0}
                aria-label="Previous template"
              >
                <ChevronLeft size={20} />
              </ActionIcon>

              <div className={styles.singleInfo}>
                <Text size="sm" fw={500}>
                  {currentTemplate?.name}
                </Text>
                <Text size="xs" c="primary">
                  {clampedIndex + 1} of {templates.length}
                </Text>
              </div>

              <ActionIcon
                variant="subtle"
                color="gray"
                size="lg"
                onClick={handleNext}
                disabled={clampedIndex >= templates.length - 1}
                aria-label="Next template"
              >
                <ChevronRight size={20} />
              </ActionIcon>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
