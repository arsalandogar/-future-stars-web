import { Button, Text, Title } from '@mantine/core';
import { Link } from '@tanstack/react-router';
import { AlertTriangle, LinkIcon, SearchX } from 'lucide-react';

import styles from './shared-link-error.module.css';

type ErrorType = 'not-found' | 'expired' | 'generic';

interface SharedLinkErrorProps {
  type: ErrorType;
}

const errorConfig: Record<
  ErrorType,
  { icon: typeof SearchX; title: string; description: string }
> = {
  'not-found': {
    icon: SearchX,
    title: "This shared link doesn't exist",
    description:
      'The link you followed may be incorrect or the shared content may have been removed.',
  },
  expired: {
    icon: LinkIcon,
    title: 'This link has expired or been deactivated',
    description:
      'The person who shared this content may have deactivated the link.',
  },
  generic: {
    icon: AlertTriangle,
    title: 'Something went wrong',
    description:
      'We encountered an error loading this shared content. Please try again later.',
  },
};

export function SharedLinkError({ type }: SharedLinkErrorProps) {
  const config = errorConfig[type];
  const Icon = config.icon;

  return (
    <div className={styles.container}>
      <div className={styles.icon}>
        <Icon size={36} />
      </div>
      <Title order={2} className={styles.title}>
        {config.title}
      </Title>
      <Text className={styles.description}>{config.description}</Text>
      <Button component={Link} to="/" variant="outline" radius="xl" size="md">
        Go Home
      </Button>
    </div>
  );
}
