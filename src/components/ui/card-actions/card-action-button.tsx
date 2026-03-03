import type { ReactNode } from 'react';

import styles from './card-actions.module.css';

interface CardActionButtonProps {
  icon: ReactNode;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

export function CardActionButton({
  icon,
  label,
  onClick,
  disabled,
  className,
}: CardActionButtonProps) {
  return (
    <button
      type="button"
      className={`${styles.actionButton} ${className ?? ''}`}
      onClick={onClick}
      disabled={disabled}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
