import {
  type ComponentProps,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Link } from '@tanstack/react-router';

import styles from './content-tabs.module.css';

export interface ContentTabItem {
  label: string;
  value: string;
  linkProps?: {
    to: ComponentProps<typeof Link>['to'];
    search?: Record<string, unknown>;
  };
}

interface ContentTabsProps {
  items: ContentTabItem[];
  activeValue: string;
  onChange?: (value: string) => void;
  gap?: string | number;
  size?: 'sm' | 'md' | 'lg';
}

const SIZE_MAP = {
  sm: 'var(--mantine-font-size-sm)',
  md: 'var(--mantine-font-size-md)',
  lg: 'var(--mantine-font-size-lg)',
};

export function ContentTabs({
  items,
  activeValue,
  onChange,
  gap = 'var(--mantine-spacing-xl)',
  size = 'md',
}: ContentTabsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Map<string, HTMLElement>>(new Map());
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  const updateIndicator = useCallback(() => {
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
  }, [activeValue]);

  useEffect(() => {
    updateIndicator();
  }, [updateIndicator]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver(updateIndicator);
    observer.observe(container);
    return () => observer.disconnect();
  }, [updateIndicator]);

  function getTabProps(item: ContentTabItem) {
    return {
      ref: (el: HTMLElement | null) => {
        if (el) tabRefs.current.set(item.value, el);
      },
      className: styles.tab,
      'data-active': activeValue === item.value || undefined,
      style: { fontSize: SIZE_MAP[size] },
    } as const;
  }

  return (
    <div ref={containerRef} className={styles.container} style={{ gap }}>
      {items.map((item) =>
        item.linkProps ? (
          <Link
            key={item.value}
            {...getTabProps(item)}
            to={item.linkProps.to}
            search={item.linkProps.search as never}
          >
            {item.label}
          </Link>
        ) : (
          <button
            key={item.value}
            {...getTabProps(item)}
            type="button"
            onClick={() => onChange?.(item.value)}
          >
            {item.label}
          </button>
        )
      )}
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
