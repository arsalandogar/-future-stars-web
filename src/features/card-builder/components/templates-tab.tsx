import { Loader, SimpleGrid, Text } from '@mantine/core';

import { ContentTabs } from '@/components/ui/content-tabs';

import type {
  BrowseTemplate,
  TagWithTemplates,
} from '@/features/templates-browse';

import { useCardBuilderStore } from '../stores/card-builder-store';
import { TemplateThumbnail } from './template-thumbnail';

import styles from './templates-tab.module.css';

interface TemplatesTabProps {
  tags: TagWithTemplates[];
  isLoading: boolean;
}

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
  selectedTemplateId: number | null;
  onSelect: (id: number) => void;
}) {
  if (isLoading) {
    return (
      <div className={styles.loader}>
        <Loader color="white" size="md" />
      </div>
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
    <SimpleGrid cols={{ base: 2, xs: 3, sm: 4, md: 5 }} spacing="md">
      {templates.map((template) => (
        <TemplateThumbnail
          key={template.id}
          imageUrl={template.templateImageMedium}
          label={template.label}
          selected={selectedTemplateId === template.id}
          onClick={() => onSelect(template.id)}
        />
      ))}
    </SimpleGrid>
  );
}

export function TemplatesTab({ tags, isLoading }: TemplatesTabProps) {
  const {
    selectedTemplateId,
    activeTagFilter,
    selectTemplate,
    setActiveTagFilter,
  } = useCardBuilderStore();

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
          selectedTemplateId={selectedTemplateId}
          onSelect={selectTemplate}
        />
      </div>
    </div>
  );
}
