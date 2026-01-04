import { Anchor, Breadcrumbs, Text, Title } from '@mantine/core';
import { Link } from '@tanstack/react-router';

import { useBreadcrumbs } from '../hooks/use-breadcrumbs';
import { usePageHeaderStore } from '@/stores/page-header-store';

export function PageHeader() {
  const title = usePageHeaderStore((s) => s.title);
  const description = usePageHeaderStore((s) => s.description);
  const breadcrumbs = useBreadcrumbs();

  if (!title) return null;

  return (
    <div className="mb-6 flex items-center justify-between">
      <div>
        <Title order={2}>{title}</Title>
        {description && (
          <Text size="sm" c="dimmed">
            {description}
          </Text>
        )}
      </div>
      {breadcrumbs.length > 0 && (
        <Breadcrumbs>
          {breadcrumbs.map((item, index) => (
            <Anchor
              key={item.href}
              component={Link}
              to={item.href}
              c={index === breadcrumbs.length - 1 ? undefined : 'dimmed'}
              size="sm"
            >
              {item.label}
            </Anchor>
          ))}
        </Breadcrumbs>
      )}
    </div>
  );
}
