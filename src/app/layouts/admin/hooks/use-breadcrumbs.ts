import { useMatches } from '@tanstack/react-router';

import { usePageHeaderStore } from '@/stores/page-header-store';

export interface BreadcrumbItem {
  label: string;
  href: string;
}

// Map pathname segments to display labels
const PATH_LABELS: Record<string, string> = {
  admin: 'Home',
  users: 'Users',
  orders: 'Orders',
  templates: 'Templates',
  tags: 'Tags',
  'featured-items': 'Featured Items',
  'template-types': 'Template Types',
  configs: 'Configs',
  terms: 'Terms & Conditions',
  'privacy-policy': 'Privacy Policy',
  'color-leagues': 'Color Leagues',
  'color-presets': 'Color Presets',
  create: 'Create',
  edit: 'Edit',
  versions: 'Versions',
};

export function useBreadcrumbs(): BreadcrumbItem[] {
  const matches = useMatches();
  const dynamicBreadcrumb = usePageHeaderStore((s) => s.dynamicBreadcrumb);

  // Get the current pathname from the last match
  const lastMatch = matches[matches.length - 1];
  if (!lastMatch) return [];

  const pathname = lastMatch.pathname;

  // Only process admin routes
  if (!pathname.startsWith('/admin')) return [];

  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [];

  let currentPath = '';
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    currentPath += `/${segment}`;

    // Skip numeric IDs and use dynamic breadcrumb for them
    if (/^\d+$/.test(segment)) {
      if (dynamicBreadcrumb) {
        breadcrumbs.push({
          label: dynamicBreadcrumb,
          href: currentPath,
        });
      }
      continue;
    }

    const label = PATH_LABELS[segment];
    if (label) {
      breadcrumbs.push({
        label,
        href: currentPath,
      });
    }
  }

  return breadcrumbs;
}
