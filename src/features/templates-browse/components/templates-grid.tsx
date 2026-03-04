import { Loader, SimpleGrid } from '@mantine/core';

import { useInfiniteScroll } from '@/hooks';

import type { BrowseTemplate } from '../types';

import { TemplateCard } from './template-card';

interface TemplatesGridProps {
  templates: BrowseTemplate[];
  onTemplateClick: (template: BrowseTemplate) => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => unknown;
}

export function TemplatesGrid({
  templates,
  onTemplateClick,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
}: TemplatesGridProps) {
  const { ref } = useInfiniteScroll({
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  });

  return (
    <div>
      <SimpleGrid cols={{ base: 2, xs: 3, sm: 4, md: 5, lg: 6 }} spacing="md">
        {templates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            onClick={() => onTemplateClick(template)}
          />
        ))}
      </SimpleGrid>

      {hasNextPage && (
        <div ref={ref} className="flex justify-center py-8">
          {isFetchingNextPage && <Loader size="sm" />}
        </div>
      )}
    </div>
  );
}
