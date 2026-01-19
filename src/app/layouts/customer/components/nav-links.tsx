import { NavTabs } from '@/components/ui/nav-tabs';

const NAV_ITEMS = [
  { label: 'HOME', to: '/' },
  { label: 'TEMPLATES', to: '/templates' },
  { label: 'MY CARDS', to: '/my-cards' },
  { label: 'ACCOUNT', to: '/account' },
] as const;

interface NavLinksProps {
  onClick?: () => void;
  vertical?: boolean;
}

export function NavLinks({ onClick, vertical }: NavLinksProps) {
  return (
    <NavTabs items={[...NAV_ITEMS]} onClick={onClick} vertical={vertical} />
  );
}
