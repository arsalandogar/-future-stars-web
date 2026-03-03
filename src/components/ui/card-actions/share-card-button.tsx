import { Share2 } from 'lucide-react';

import { CardActionButton } from './card-action-button';

interface ShareCardButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

export function ShareCardButton({
  onClick,
  disabled,
  className,
}: ShareCardButtonProps) {
  return (
    <CardActionButton
      icon={<Share2 size={18} />}
      label="Share Card"
      onClick={onClick}
      disabled={disabled}
      className={className}
    />
  );
}
