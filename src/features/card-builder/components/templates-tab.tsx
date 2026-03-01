import { AspectRatio, SimpleGrid, Skeleton, Text } from '@mantine/core';
import { useQueryClient } from '@tanstack/react-query';
import { getRouteApi } from '@tanstack/react-router';

import { ContentTabs } from '@/components/ui/content-tabs';

import type {
  BrowseTemplate,
  TagWithTemplates,
} from '@/features/templates-browse';

import { useTemplateSvgJson } from '../api/get-template-svg-json';
import { useCardBuilderStore } from '../stores/card-builder-store';
import { useCardEditorStore } from '../stores/card-editor-store';
import { TemplateThumbnail } from './template-thumbnail';

import styles from './templates-tab.module.css';

const routeApi = getRouteApi('/_authenticated/_customer/create-card');

interface TemplatesTabProps {
  tags: TagWithTemplates[];
  isLoading: boolean;
}

const TEMPLATE_GRID_COLS = { base: 2, xs: 3, sm: 4, md: 5 } as const;
const TEMPLATE_GRID_SPACING = 'md';
const TEMPLATE_SKELETON_COUNT = 10;
const TEMPLATE_SKELETON_KEYS = Array.from(
  { length: TEMPLATE_SKELETON_COUNT },
  (_, index) => `template-skeleton-${index + 1}`
);

function getFilteredTemplates(
  tags: TagWithTemplates[],
  activeTagFilter: string | null
): BrowseTemplate[] {
  if (!activeTagFilter) {
    const seen = new Set<number>();
    return tags.flatMap((tag) =>
      tag.templates.filter((t) => {
        if (seen.has(t.id)) return false;
        seen.add(t.id);
        return true;
      })
    );
  }

  const tag = tags.find((t) => t.name === activeTagFilter);
  return tag?.templates ?? [];
}

function TemplatesGridContent({
  isLoading,
  templates,
  selectedTemplateId,
  onSelect,
}: {
  isLoading: boolean;
  templates: BrowseTemplate[];
  selectedTemplateId?: number;
  onSelect: (id: number) => void;
}) {
  const queryClient = useQueryClient();

  const prefetchTemplate = (id: number) => {
    void queryClient.prefetchQuery(useTemplateSvgJson.getOptions(id));
  };

  if (isLoading) {
    return (
      <SimpleGrid cols={TEMPLATE_GRID_COLS} spacing={TEMPLATE_GRID_SPACING}>
        {TEMPLATE_SKELETON_KEYS.map((skeletonKey) => (
          <AspectRatio
            key={skeletonKey}
            ratio={2.5 / 3.5}
            className={styles.skeletonCard}
          >
            <Skeleton radius={0} className={styles.skeletonFill} />
          </AspectRatio>
        ))}
      </SimpleGrid>
    );
  }

  if (templates.length === 0) {
    return (
      <Text c="dimmed" ta="center" py="xl">
        No templates available
      </Text>
    );
  }

  return (
    <SimpleGrid cols={TEMPLATE_GRID_COLS} spacing={TEMPLATE_GRID_SPACING}>
      {templates.map((template) => (
        <TemplateThumbnail
          key={template.id}
          imageUrl={template.templateImageMedium}
          label={template.label}
          selected={selectedTemplateId === template.id}
          onClick={() => onSelect(template.id)}
          onPrefetch={() => prefetchTemplate(template.id)}
        />
      ))}
    </SimpleGrid>
  );
}

export function TemplatesTab({ tags, isLoading }: TemplatesTabProps) {
  const { templateId } = routeApi.useSearch();
  const navigate = routeApi.useNavigate();
  const activeTagFilter = useCardBuilderStore((s) => s.activeTagFilter);
  const setActiveTagFilter = useCardBuilderStore((s) => s.setActiveTagFilter);
  const setActiveSide = useCardEditorStore((s) => s.setActiveSide);

  const selectTemplate = (id: number) => {
    setActiveSide('front');
    void navigate({
      search: (prev) => ({ ...prev, templateId: id }),
      replace: true,
    });
  };

  const tabItems = [
    { label: 'All', value: '' },
    ...tags.map((tag) => ({ label: tag.label, value: tag.name })),
  ];

  const templates = getFilteredTemplates(tags, activeTagFilter);

  return (
    <div className={styles.container}>
      <div className={styles.filters}>
        <ContentTabs
          items={tabItems}
          activeValue={activeTagFilter ?? ''}
          onChange={(value) => setActiveTagFilter(value || null)}
          gap="var(--mantine-spacing-md)"
        />
      </div>

      <div className={styles.grid}>
        <TemplatesGridContent
          isLoading={isLoading}
          templates={templates}
          selectedTemplateId={templateId}
          onSelect={selectTemplate}
        />
      </div>
    </div>
  );
}
