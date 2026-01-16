import { Link } from '@tanstack/react-router';
import { Group, ScrollArea, Title } from '@mantine/core';
import { ArrowRight } from 'lucide-react';

import type { BrowseTemplate, TagWithTemplates } from '../types';

import { TemplateCard } from './template-card';

interface TemplateCarouselProps {
  tag: TagWithTemplates;
  onTemplateClick: (template: BrowseTemplate) => void;
}

export function TemplateCarousel({
  tag,
  onTemplateClick,
}: TemplateCarouselProps) {
  if (tag.templates.length === 0) return null;

  return (
    <div className="mb-10">
      <Group justify="space-between" mb="md">
        <Title order={2} size="h3" c="white">
          {tag.label} Cards
        </Title>
        <Link
          to="/templates"
          search={{ tag: tag.name }}
          className="flex items-center gap-1 text-sm text-gray-400 hover:text-white"
        >
          See All <ArrowRight size={16} />
        </Link>
      </Group>
      <ScrollArea type="scroll" offsetScrollbars={false}>
        <div className="flex gap-4 py-3 px-1">
          {tag.templates.map((template) => (
            <div key={template.id} className="w-35 shrink-0">
              <TemplateCard
                template={template}
                onClick={() => onTemplateClick(template)}
              />
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
