import { Link } from '@tanstack/react-router';
import { Plus } from 'lucide-react';

import styles from './create-card-button.module.css';

export function CreateCardButton() {
  return (
    <Link to="/create-card" className={styles.container}>
      <div className={styles.card}>
        <div className={styles.innerBorder}>
          <Plus size={64} className={styles.icon} />
        </div>
      </div>
    </Link>
  );
}
