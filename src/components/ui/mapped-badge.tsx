import {
  Badge,
  type BadgeVariant,
  type MantineColor,
  type MantineSize,
} from '@mantine/core';

interface MappedBadgeProps<T extends string> {
  value: T;
  colorMap: Record<T, MantineColor>;
  size?: MantineSize;
  variant?: BadgeVariant;
}

export function MappedBadge<T extends string>({
  value,
  colorMap,
  size = 'sm',
  variant = 'light',
}: MappedBadgeProps<T>) {
  return (
    <Badge
      tt="capitalize"
      color={colorMap[value]}
      variant={variant}
      size={size}
    >
      {value}
    </Badge>
  );
}
