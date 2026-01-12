import { AppShell, MantineProvider, useMantineTheme } from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { Outlet } from '@tanstack/react-router';

import { AdminHeader } from './components/admin-header';
import { AdminNavbar } from './components/admin-navbar';
import { PageHeader } from './components/page-header';
import { useHeaderStore } from './stores/header-store';
import { useSidebarStore } from './stores/sidebar-store';

const NAVBAR_WIDTH = 260;
const NAVBAR_COLLAPSED_WIDTH = 72;
const NAVBAR_BREAKPOINT = 'sm';

const HEADER_HEIGHT = 76;
const HEADER_HEIGHT_EXPANDED = 136;

export function AdminLayout() {
  const theme = useMantineTheme();
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const { collapsed: desktopCollapsed, toggle: toggleDesktop } =
    useSidebarStore();
  const mobileMenuOpen = useHeaderStore((state) => state.mobileMenuOpen);
  const isDesktop = useMediaQuery(
    `(min-width: ${theme.breakpoints[NAVBAR_BREAKPOINT]})`
  );

  // On mobile: always show expanded, on desktop: use persisted state
  // isDesktop can be undefined on initial render, treat as mobile
  const isCollapsed = isDesktop === true ? desktopCollapsed : false;

  // Header height: expanded on mobile when menu is open
  const headerHeight =
    isDesktop !== true && mobileMenuOpen
      ? HEADER_HEIGHT_EXPANDED
      : HEADER_HEIGHT;

  return (
    <MantineProvider defaultColorScheme="dark">
      <AppShell
        layout="alt"
        header={{ height: headerHeight }}
        navbar={{
          width: isCollapsed ? NAVBAR_COLLAPSED_WIDTH : NAVBAR_WIDTH,
          breakpoint: NAVBAR_BREAKPOINT,
          collapsed: { mobile: !mobileOpened },
        }}
        padding="md"
      >
        <AppShell.Header>
          <AdminHeader opened={mobileOpened} toggle={toggleMobile} />
        </AppShell.Header>

        <AppShell.Navbar>
          <AdminNavbar
            collapsed={isCollapsed}
            onToggle={toggleDesktop}
            isMobile={isDesktop !== true}
            onMobileClose={toggleMobile}
          />
        </AppShell.Navbar>

        <AppShell.Main>
          <PageHeader />
          <Outlet />
        </AppShell.Main>
      </AppShell>
    </MantineProvider>
  );
}
