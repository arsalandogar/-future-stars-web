import { Link } from '@tanstack/react-router';
import { Pencil } from 'lucide-react';

import styles from './card-actions.module.css';

interface EditCardButtonProps {
  cardId: number;
  className?: string;
}

export function EditCardButton({ cardId, className }: EditCardButtonProps) {
  return (
    <Link
      to="/edit-card/$cardId"
      params={{ cardId: String(cardId) }}
      className={`${styles.actionButton} ${className ?? ''}`}
    >
      <Pencil size={18} />
      <span>Edit Card</span>
    </Link>
  );
}
