import type { ReactNode } from 'react';

import styles from './content-panel.module.css';

interface ContentPanelProps {
  children: ReactNode;
  className?: string;
}

export function ContentPanel({ children, className }: ContentPanelProps) {
  return <div className={`${styles.panel} ${className ?? ''}`}>{children}</div>;
}
