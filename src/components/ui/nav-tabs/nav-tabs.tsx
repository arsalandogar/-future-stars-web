import { Link } from '@tanstack/react-router';

import styles from './nav-tabs.module.css';

export interface NavTabItem {
  label: string;
  to?: string;
  value?: string;
}

interface NavTabsProps {
  items: NavTabItem[];
  activeValue?: string;
  onChange?: (value: string) => void;
  onClick?: () => void;
  vertical?: boolean;
  gap?: string | number;
}

export function NavTabs({
  items,
  activeValue,
  onChange,
  onClick,
  vertical,
  gap = 'var(--mantine-spacing-xl)',
}: NavTabsProps) {
  const containerClass = `${styles.container} ${vertical ? styles.containerVertical : ''}`;
  const tabClass = `${styles.tab} ${vertical ? styles.tabVertical : ''}`;

  return (
    <div className={containerClass} style={{ gap }}>
      {items.map((item) => {
        if (item.to) {
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onClick}
              className={tabClass}
              activeProps={{ 'data-active': 'true' }}
              activeOptions={{ exact: item.to === '/' }}
            >
              {item.label}
            </Link>
          );
        }

        const isActive = activeValue === item.value;

        return (
          <button
            key={item.value}
            type="button"
            className={tabClass}
            data-active={isActive ? 'true' : undefined}
            onClick={() => {
              onChange?.(item.value!);
              onClick?.();
            }}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
