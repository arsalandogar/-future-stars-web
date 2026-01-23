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
  return (
    <div className={styles.container} style={{ gap }}>
      {items.map((item) => {
        const isActive = activeValue === item.value;

        return (
          <button
            key={item.value}
            type="button"
            className={styles.tab}
            data-active={isActive ? 'true' : undefined}
            onClick={() => onChange(item.value)}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
