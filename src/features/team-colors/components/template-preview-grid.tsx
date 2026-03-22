import {
  ActionIcon,
  AspectRatio,
  Group,
  Image,
  Loader,
  SimpleGrid,
  Text,
} from '@mantine/core';
import { GalleryHorizontalEnd, Image as ImageIcon } from 'lucide-react';

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

interface TemplatePreviewGridProps {
  side: 'all' | TemplateSide;
  onSideChange: (side: 'all' | TemplateSide) => void;
  /** Color pairs from the palette (bg + fg per area). */
  colorPairs: ColorPair[];
}

export function TemplatePreviewGrid({
  side,
  onSideChange,
  colorPairs,
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
            variant="subtle"
            size="sm"
            color="gray"
            title="Image view"
          >
            <ImageIcon size={16} />
          </ActionIcon>
          <ActionIcon
            variant="subtle"
            size="sm"
            color="gray"
            title="Gallery view"
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
        ) : (
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
        )}
      </div>
    </div>
  );
}
