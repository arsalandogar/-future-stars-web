import { getRouteApi, useNavigate } from '@tanstack/react-router';
import { Button, Skeleton, Text, Title } from '@mantine/core';

import { Head } from '@/components/seo/head';

import { useBrowseTemplates } from '../api/browse-templates';
import { TagFilterChips } from '../components/tag-filter-chips';
import { TemplateCarousel } from '../components/template-carousel';
import { TemplatePreviewModal } from '../components/template-preview-modal';
import { TemplatesGrid } from '../components/templates-grid';
import type { BrowseTemplate, TagWithTemplates } from '../types';

const routeApi = getRouteApi('/_authenticated/_customer/templates');

export function TemplatesBrowsePage() {
  const { tag, preview } = routeApi.useSearch();
  const navigate = useNavigate();

  const { data, isLoading, error } = useBrowseTemplates({});

  const handleTagChange = (newTag: string | null) => {
    void navigate({
      to: '.',
      search: { tag: newTag ?? undefined, preview },
    });
  };

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

  // Find the template to preview from URL param
  const allTemplates = data?.data.flatMap((tagItem) => tagItem.templates) ?? [];
  const selectedTemplate = preview
    ? (allTemplates.find((tpl) => tpl.id === preview) ?? null)
    : null;
  const modalOpened = !!selectedTemplate;

  const filteredTags = tag
    ? data?.data.filter((tagItem) => tagItem.name === tag)
    : data?.data;

  // If tag filter is active, show grid view
  const showGrid = !!tag;

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
        {isLoading ? (
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
          <TagFilterChips
            tags={data?.data ?? []}
            selected={tag ?? null}
            onChange={handleTagChange}
          />
        )}
      </div>

      <TemplateContent
        isLoading={isLoading}
        error={error}
        showGrid={showGrid}
        filteredTags={filteredTags}
        onTemplateClick={handleTemplateClick}
      />

      {modalOpened && selectedTemplate ? (
        <TemplatePreviewModal
          template={selectedTemplate}
          allTags={data?.data ?? []}
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
    <div className="flex flex-col gap-10">
      {Array.from({ length: 3 }).map((_, i) => (
        // eslint-disable-next-line react-x/no-array-index-key -- static skeleton placeholders
        <div key={`row-skeleton-${i}`}>
          <Skeleton height={28} width={200} mb="md" />
          <div className="flex gap-4">
            {Array.from({ length: 5 }).map((_, j) => (
              <Skeleton
                // eslint-disable-next-line react-x/no-array-index-key
                key={`card-skeleton-${i}-${j}`}
                height={240}
                width={180}
                radius="md"
              />
            ))}
          </div>
        </div>
      ))}
    </div>
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
  showGrid: boolean;
  filteredTags: TagWithTemplates[] | undefined;
  onTemplateClick: (template: BrowseTemplate) => void;
}

function TemplateContent({
  isLoading,
  error,
  showGrid,
  filteredTags,
  onTemplateClick,
}: TemplateContentProps) {
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return <ErrorState onRetry={() => window.location.reload()} />;
  }

  if (showGrid) {
    return (
      <TemplatesGrid
        templates={filteredTags?.[0]?.templates ?? []}
        onTemplateClick={onTemplateClick}
      />
    );
  }

  return (
    <>
      {filteredTags?.map((tagItem) => (
        <TemplateCarousel
          key={tagItem.id}
          tag={tagItem}
          onTemplateClick={onTemplateClick}
        />
      ))}
    </>
  );
}
