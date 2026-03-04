import { ContentTabs, type ContentTabItem } from '@/components/ui/content-tabs';

import type { BuilderTab } from '../types';
import { useCardBuilderStore } from '../stores/card-builder-store';
import { ColorsTab } from './colors-tab';
import { ContentTab } from './content-tab';
import { PhotoTab } from './photo-tab';
import { TemplatesTab } from './templates-tab';

import styles from './builder-tabs-panel.module.css';

const TAB_ITEMS: ContentTabItem[] = [
  { label: 'Content', value: 'content' },
  { label: 'Colors', value: 'colors' },
  { label: 'Photo', value: 'photo' },
  { label: 'Templates', value: 'templates' },
];

export function BuilderTabsPanel() {
  const activeTab = useCardBuilderStore((s) => s.activeTab);
  const setActiveTab = useCardBuilderStore((s) => s.setActiveTab);

  return (
    <div className={styles.panel}>
      <div className={styles.tabs}>
        <ContentTabs
          items={TAB_ITEMS}
          activeValue={activeTab}
          onChange={(value) => setActiveTab(value as BuilderTab)}
          size="lg"
          gap="3rem"
        />
      </div>

      <div className={styles.content}>
        {activeTab === 'content' && <ContentTab />}
        {activeTab === 'colors' && <ColorsTab />}
        {activeTab === 'photo' && <PhotoTab />}
        {activeTab === 'templates' && <TemplatesTab />}
      </div>
    </div>
  );
}
