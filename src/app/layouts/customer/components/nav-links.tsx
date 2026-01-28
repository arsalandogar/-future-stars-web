import { Link } from '@tanstack/react-router';

import classes from './customer-header.module.css';

const NAV_ITEMS = [
  { label: 'HOME', to: '/' },
  { label: 'TEMPLATES', to: '/templates' },
  { label: 'MY CARDS', to: '/my-cards' },
] as const;

interface NavLinksProps {
  onClick?: () => void;
  vertical?: boolean;
}

export function NavLinks({ onClick, vertical }: NavLinksProps) {
  return (
    <>
      {NAV_ITEMS.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          onClick={onClick}
          className={`${classes.navLink} ${vertical ? classes.navLinkVertical : ''}`}
          activeProps={{ 'data-active': 'true' }}
          activeOptions={{ exact: item.to === '/' }}
        >
          {item.label}
        </Link>
      ))}
    </>
  );
}
