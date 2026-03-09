import { ContentTabs, type ContentTabItem } from '@/components/ui/content-tabs';

import type { BuilderTab } from '../types';
import { useCardBuilderStore } from '../stores/card-builder-store';
import { ColorsTab } from './colors-tab';
import { ContentTab } from './content-tab';
import { PhotoTab } from './photo-tab';
import { TemplatesTab } from './templates-tab';

import styles from './builder-tabs-panel.module.css';

const BASE_TAB_ITEMS: ContentTabItem[] = [
  { label: 'Content', value: 'content' },
  { label: 'Colors', value: 'colors' },
  { label: 'Photo', value: 'photo' },
];

const ALL_TAB_ITEMS: ContentTabItem[] = [
  ...BASE_TAB_ITEMS,
  { label: 'Templates', value: 'templates' },
];

interface BuilderTabsPanelProps {
  defaultTab: BuilderTab;
  showTemplatesTab?: boolean;
}

export function BuilderTabsPanel({
  defaultTab,
  showTemplatesTab = true,
}: BuilderTabsPanelProps) {
  const activeTab = useCardBuilderStore((s) => s.activeTab);
  const setActiveTab = useCardBuilderStore((s) => s.setActiveTab);

  const effectiveTab = activeTab ?? defaultTab;

  return (
    <div className={styles.panel}>
      <div className={styles.tabs}>
        <ContentTabs
          items={showTemplatesTab ? ALL_TAB_ITEMS : BASE_TAB_ITEMS}
          activeValue={effectiveTab}
          onChange={(value) => setActiveTab(value as BuilderTab)}
          size="lg"
          gap="3rem"
        />
      </div>

      <div className={styles.content}>
        {effectiveTab === 'content' && <ContentTab />}
        {effectiveTab === 'colors' && <ColorsTab />}
        {effectiveTab === 'photo' && <PhotoTab />}
        {showTemplatesTab && effectiveTab === 'templates' && <TemplatesTab />}
      </div>
    </div>
  );
}
