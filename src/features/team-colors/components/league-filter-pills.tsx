import type { League } from '@/features/colors';

import styles from './league-filter-pills.module.css';

interface LeagueFilterPillsProps {
  leagues: League[];
  activeFilter: 'all' | 'popular' | number;
  onChange: (value: 'all' | 'popular' | number) => void;
}

export function LeagueFilterPills({
  leagues,
  activeFilter,
  onChange,
}: LeagueFilterPillsProps) {
  return (
    <div className={styles.pills}>
      <button
        type="button"
        className={styles.pill}
        data-active={activeFilter === 'all' || undefined}
        onClick={() => onChange('all')}
      >
        All
      </button>
      <button
        type="button"
        className={styles.pill}
        data-active={activeFilter === 'popular' || undefined}
        onClick={() => onChange('popular')}
      >
        Popular
      </button>
      {leagues.map((league) => (
        <button
          key={league.id}
          type="button"
          className={styles.pill}
          data-active={activeFilter === league.id || undefined}
          onClick={() => onChange(league.id)}
        >
          {league.label}
        </button>
      ))}
    </div>
  );
}
