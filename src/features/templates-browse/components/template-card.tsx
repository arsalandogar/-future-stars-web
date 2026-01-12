import { Image } from '@mantine/core';

import type { BrowseTemplate } from '../types';

import styles from './template-card.module.css';

interface TemplateCardProps {
  template: BrowseTemplate;
  onClick: () => void;
}

export function TemplateCard({ template, onClick }: TemplateCardProps) {
  return (
    <button
      type="button"
      className={styles.card}
      onClick={onClick}
      aria-label={`Preview ${template.label} template`}
    >
      <Image
        src={template.templateImageMedium}
        alt={template.label}
        fallbackSrc="/placeholder-template.png"
      />
    </button>
  );
}
