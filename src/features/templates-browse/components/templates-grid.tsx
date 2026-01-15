import { SimpleGrid } from '@mantine/core';

import type { BrowseTemplate } from '../types';

import { TemplateCard } from './template-card';

interface TemplatesGridProps {
  templates: BrowseTemplate[];
  onTemplateClick: (template: BrowseTemplate) => void;
}

export function TemplatesGrid({
  templates,
  onTemplateClick,
}: TemplatesGridProps) {
  return (
    <SimpleGrid cols={{ base: 2, xs: 3, sm: 4, md: 5, lg: 6 }} spacing="md">
      {templates.map((template) => (
        <TemplateCard
          key={template.id}
          template={template}
          onClick={() => onTemplateClick(template)}
        />
      ))}
    </SimpleGrid>
  );
}
