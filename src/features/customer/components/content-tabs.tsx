import { useEffect, useRef, useState } from 'react';

import styles from './content-tabs.module.css';

export interface ContentTabItem {
  label: string;
  value: string;
}

interface ContentTabsProps {
  items: ContentTabItem[];
  activeValue: string;
  onChange: (value: string) => void;
  gap?: string | number;
}

export function ContentTabs({
  items,
  activeValue,
  onChange,
  gap = 'var(--mantine-spacing-xl)',
}: ContentTabsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  useEffect(() => {
    const activeTab = tabRefs.current.get(activeValue);
    const container = containerRef.current;
    if (activeTab && container) {
      const containerRect = container.getBoundingClientRect();
      const tabRect = activeTab.getBoundingClientRect();
      setIndicatorStyle({
        left: tabRect.left - containerRect.left,
        width: tabRect.width,
      });
    }
  }, [activeValue, items]);

  return (
    <div ref={containerRef} className={styles.container} style={{ gap }}>
      {items.map((item) => {
        const isActive = activeValue === item.value;

        return (
          <button
            key={item.value}
            ref={(el) => {
              if (el) tabRefs.current.set(item.value, el);
            }}
            type="button"
            className={styles.tab}
            data-active={isActive ? 'true' : undefined}
            onClick={() => onChange(item.value)}
          >
            {item.label}
          </button>
        );
      })}
      <div
        className={styles.indicator}
        style={{
          transform: `translateX(${indicatorStyle.left}px)`,
          width: indicatorStyle.width,
        }}
      />
    </div>
  );
}
