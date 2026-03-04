import { useMemo } from 'react';
import { getRouteApi, useNavigate } from '@tanstack/react-router';
import {
  AspectRatio,
  Button,
  SimpleGrid,
  Skeleton,
  Text,
  Title,
} from '@mantine/core';

import { Head } from '@/components/seo/head';
import { DEFAULT_PAGE_LIMIT, flattenInfiniteData } from '@/lib/react-query';

import { useTemplateTags } from '../api/get-tags';
import { useTemplate } from '../api/get-template';
import { useTemplates } from '../api/get-templates';
import { TagFilterChips } from '../components/tag-filter-chips';
import { TemplatePreviewModal } from '../components/template-preview-modal';
import { TemplatesGrid } from '../components/templates-grid';
import type { BrowseTemplate } from '../types';

const routeApi = getRouteApi('/_authenticated/_customer/templates');

export function TemplatesBrowsePage() {
  const { tag, preview } = routeApi.useSearch();
  const navigate = useNavigate();

  const { data: tags, isLoading: isLoadingTags } = useTemplateTags({});

  // Find the selected tag to get its ID for filtering
  const selectedTag = useMemo(
    () => (tag ? tags?.find((t) => t.name === tag) : undefined),
    [tag, tags]
  );

  const {
    data: templatesData,
    isLoading: isLoadingTemplates,
    error,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useTemplates({
    variables: {
      tagIds: selectedTag ? [selectedTag.id] : undefined,
      limit: DEFAULT_PAGE_LIMIT,
    },
  });

  // Always fetch the previewed template so it's available even before scrolled into view
  const { data: previewedTemplate } = useTemplate({
    variables: preview ?? 0,
    enabled: preview != null,
  });

  const templates = flattenInfiniteData(templatesData);

  const handleTemplateClick = (template: BrowseTemplate) => {
    void navigate({
      to: '.',
      search: { tag, preview: template.id },
    });
  };

  const handleCloseModal = () => {
    void navigate({
      to: '.',
      search: { tag, preview: undefined },
    });
  };

  const handleTemplateChange = (templateId: number) => {
    void navigate({
      to: '.',
      search: { tag, preview: templateId },
    });
  };

  const selectedTemplate = preview
    ? (templates.find((tpl) => tpl.id === preview) ?? previewedTemplate ?? null)
    : null;
  const modalOpened = !!selectedTemplate;

  const isLoading = isLoadingTags || isLoadingTemplates;

  return (
    <>
      <Head title="Templates" description="Browse our card templates" />
      <Title order={1} c="white" fw={800} mb="xs">
        CHOOSE YOUR TEMPLATE
      </Title>
      <Text c="gray.4" size="lg" mb="xl">
        Browse our collections to find the perfect style for your card.
      </Text>

      <div className="mb-8">
        {isLoadingTags ? (
          <div className="flex gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton
                // eslint-disable-next-line react-x/no-array-index-key
                key={`chip-skeleton-${i}`}
                height={32}
                width={80}
                radius="xl"
              />
            ))}
          </div>
        ) : (
          <TagFilterChips tags={tags ?? []} selected={tag ?? null} />
        )}
      </div>

      <TemplateContent
        isLoading={isLoading}
        error={error}
        templates={templates}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        fetchNextPage={fetchNextPage}
        onTemplateClick={handleTemplateClick}
      />

      {modalOpened && selectedTemplate ? (
        <TemplatePreviewModal
          template={selectedTemplate}
          tags={tags ?? []}
          templates={templates}
          opened={modalOpened}
          onClose={handleCloseModal}
          onTemplateChange={handleTemplateChange}
        />
      ) : null}
    </>
  );
}

function LoadingSkeleton() {
  return (
    <SimpleGrid cols={{ base: 2, xs: 3, sm: 4, md: 5, lg: 6 }} spacing="md">
      {Array.from({ length: 12 }, (_, i) => (
        <AspectRatio key={`skeleton-${i}`} ratio={2.5 / 3.5}>
          <Skeleton radius={0} h="100%" />
        </AspectRatio>
      ))}
    </SimpleGrid>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <Text c="gray.4" size="lg" mb="md">
        Failed to load templates
      </Text>
      <Button variant="subtle" onClick={onRetry}>
        Try again
      </Button>
    </div>
  );
}

interface TemplateContentProps {
  isLoading: boolean;
  error: Error | null;
  templates: BrowseTemplate[];
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => unknown;
  onTemplateClick: (template: BrowseTemplate) => void;
}

function TemplateContent({
  isLoading,
  error,
  templates,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  onTemplateClick,
}: TemplateContentProps) {
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return <ErrorState onRetry={() => window.location.reload()} />;
  }

  return (
    <TemplatesGrid
      templates={templates}
      onTemplateClick={onTemplateClick}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      fetchNextPage={fetchNextPage}
    />
  );
}
