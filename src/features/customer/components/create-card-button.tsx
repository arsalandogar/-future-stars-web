import { Plus } from 'lucide-react';

import styles from './create-card-button.module.css';

interface CreateCardButtonProps {
  onClick: () => void;
}

export function CreateCardButton({ onClick }: CreateCardButtonProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      className={styles.container}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
    >
      <div className={styles.card}>
        <div className={styles.innerBorder}>
          <Plus size={64} className={styles.icon} />
        </div>
      </div>
    </div>
  );
}
