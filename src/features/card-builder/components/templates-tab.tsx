import { useMemo } from 'react';
import { AspectRatio, Loader, SimpleGrid, Skeleton, Text } from '@mantine/core';
import { useQueryClient } from '@tanstack/react-query';
import { getRouteApi, useNavigate } from '@tanstack/react-router';

import { ContentTabs } from '@/components/ui/content-tabs';
import { useTemplateTags, useTemplates } from '@/features/templates-browse';
import { useInfiniteScroll } from '@/hooks';
import { DEFAULT_PAGE_LIMIT, flattenInfiniteData } from '@/lib/react-query';

import { useTemplateSvgJson } from '@/features/templates';
import { useCardBuilderStore } from '../stores/card-builder-store';
import { useCardEditorStore } from '../stores/card-editor-store';
import { TemplateThumbnail } from './template-thumbnail';

import styles from './templates-tab.module.css';

const routeApi = getRouteApi('/_authenticated/_customer/_card-builder');

const TEMPLATE_GRID_COLS = { base: 2, xs: 3, sm: 4, md: 5 } as const;
const TEMPLATE_GRID_SPACING = 'md';
const TEMPLATE_SKELETON_COUNT = 10;
const TEMPLATE_SKELETON_KEYS = Array.from(
  { length: TEMPLATE_SKELETON_COUNT },
  (_, index) => `template-skeleton-${index + 1}`
);

export function TemplatesTab() {
  const { templateId } = routeApi.useSearch();
  const navigate = useNavigate();
  const activeTagFilter = useCardBuilderStore((s) => s.activeTagFilter);
  const setActiveTagFilter = useCardBuilderStore((s) => s.setActiveTagFilter);
  const setActiveSide = useCardEditorStore((s) => s.setActiveSide);
  const queryClient = useQueryClient();

  const { data: tags, isLoading: isLoadingTags } = useTemplateTags({});

  const selectedTag = useMemo(
    () =>
      activeTagFilter
        ? tags?.find((t) => t.name === activeTagFilter)
        : undefined,
    [activeTagFilter, tags]
  );

  const {
    data: templatesData,
    isLoading: isLoadingTemplates,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useTemplates({
    variables: {
      tagIds: selectedTag ? [selectedTag.id] : undefined,
      limit: DEFAULT_PAGE_LIMIT,
    },
  });

  const templates = flattenInfiniteData(templatesData);

  const { ref } = useInfiniteScroll({
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  });

  const isLoading = isLoadingTags || isLoadingTemplates;

  const selectTemplate = (id: number) => {
    setActiveSide('front');
    void navigate({
      to: '.',
      search: (prev) => ({ ...prev, templateId: id }),
      replace: true,
    });
  };

  const prefetchTemplate = (id: number) => {
    void queryClient.prefetchQuery(useTemplateSvgJson.getOptions(id));
  };

  const tabItems = [
    { label: 'All', value: '' },
    ...(tags?.map((tag) => ({ label: tag.label, value: tag.name })) ?? []),
  ];

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
        {isLoading ? (
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
        ) : templates.length === 0 ? (
          <Text c="dimmed" ta="center" py="xl">
            No templates available
          </Text>
        ) : (
          <>
            <SimpleGrid
              cols={TEMPLATE_GRID_COLS}
              spacing={TEMPLATE_GRID_SPACING}
            >
              {templates.map((template) => (
                <TemplateThumbnail
                  key={template.id}
                  imageUrl={template.templateImageMedium}
                  label={template.label}
                  selected={templateId === template.id}
                  onClick={() => selectTemplate(template.id)}
                  onPrefetch={() => prefetchTemplate(template.id)}
                />
              ))}
            </SimpleGrid>

            {hasNextPage && (
              <div ref={ref} className="flex justify-center py-4">
                {isFetchingNextPage && <Loader size="sm" />}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
