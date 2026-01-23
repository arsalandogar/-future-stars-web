import { Divider, Text } from '@mantine/core';
import { useNavigate } from '@tanstack/react-router';
import {
  ChevronDown,
  ChevronRight,
  HelpCircle,
  LogOut,
  ShieldCheck,
  ShoppingBag,
  User,
} from 'lucide-react';
import { useState } from 'react';

import { useAuthStore } from '@/stores/auth-store';

import styles from './account-sidebar.module.css';

type Section = 'account-details' | 'payment-methods' | 'addresses' | 'orders' | 'privacy-policy';

interface AccountSidebarProps {
  activeSection: Section;
  onNavigate?: () => void;
}

const MY_INFO_SECTIONS = [
  { value: 'account-details', label: 'Account Details' },
  { value: 'payment-methods', label: 'Payment Methods' },
  { value: 'addresses', label: 'Shipping Addresses' },
] as const;

function formatMemberSince(dateString: string): string {
  const date = new Date(dateString);
  const month = date.toLocaleString('en-US', { month: 'long' });
  const year = date.getFullYear().toString().slice(-2);
  return `Collecting since ${month} '${year}`;
}

export function AccountSidebar({
  activeSection,
  onNavigate,
}: AccountSidebarProps) {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const [myInfoExpanded, setMyInfoExpanded] = useState(true);

  const isMyInfoSection = MY_INFO_SECTIONS.some(
    (s) => s.value === activeSection
  );

  const handleLogout = () => {
    clearAuth();
    void navigate({ to: '/' });
  };

  const handleSectionClick = (section: Section) => {
    void navigate({ to: '/account', search: { section } });
    onNavigate?.();
  };

  return (
    <div className={styles.container}>
      <div className={styles.userHeader}>
        <Text className={styles.userName}>{user?.fullName}</Text>
        {user?.createdAt && (
          <Text component="span" className={styles.memberSince}>
            {formatMemberSince(user.createdAt)}
          </Text>
        )}
      </div>

      <Divider color="primaryLight" my="sm" />

      <nav className={styles.nav}>
        <div className={styles.navSection}>
          <button
            type="button"
            className={`${styles.navItem} ${isMyInfoSection ? styles.active : ''}`}
            onClick={() => setMyInfoExpanded(!myInfoExpanded)}
          >
            <span
              className={`${styles.iconWrapper} ${isMyInfoSection ? styles.activeIcon : ''}`}
            >
              <User size={20} />
            </span>
            <span className={styles.navLabel}>My Info</span>
            {myInfoExpanded ? (
              <ChevronDown size={18} className={styles.chevron} />
            ) : (
              <ChevronRight size={18} className={styles.chevron} />
            )}
          </button>

          {myInfoExpanded && (
            <div className={styles.subItems}>
              {MY_INFO_SECTIONS.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  className={`${styles.subItem} ${activeSection === item.value ? styles.activeSubItem : ''}`}
                  onClick={() => handleSectionClick(item.value)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          className={`${styles.navItem} ${activeSection === 'orders' ? styles.active : ''}`}
          onClick={() => handleSectionClick('orders')}
        >
          <span
            className={`${styles.iconWrapper} ${activeSection === 'orders' ? styles.activeIcon : ''}`}
          >
            <ShoppingBag size={20} />
          </span>
          <span className={styles.navLabel}>My Orders</span>
          {activeSection === 'orders' && (
            <ChevronRight size={18} className={styles.chevron} />
          )}
        </button>

        <div className={`${styles.navItem} ${styles.disabled}`}>
          <span className={styles.iconWrapper}>
            <HelpCircle size={20} />
          </span>
          <span className={styles.navLabel}>Help & Support</span>
        </div>

        <button
          type="button"
          className={`${styles.navItem} ${activeSection === 'privacy-policy' ? styles.active : ''}`}
          onClick={() => handleSectionClick('privacy-policy')}
        >
          <span
            className={`${styles.iconWrapper} ${activeSection === 'privacy-policy' ? styles.activeIcon : ''}`}
          >
            <ShieldCheck size={20} />
          </span>
          <span className={styles.navLabel}>Privacy Policy</span>
          {activeSection === 'privacy-policy' && (
            <ChevronRight size={18} className={styles.chevron} />
          )}
        </button>
      </nav>

      <Divider color="primaryLight" my="md" />

      <button type="button" className={styles.logoutButton} onClick={handleLogout}>
        <LogOut size={20} />
        <span>Log Out</span>
      </button>
    </div>
  );
}
