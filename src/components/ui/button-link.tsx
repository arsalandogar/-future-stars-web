import { createLink, type LinkComponent } from '@tanstack/react-router';
import { Button, type ButtonProps } from '@mantine/core';

type MantineButtonLinkProps = ButtonProps &
  React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    ref?: React.Ref<HTMLAnchorElement>;
  };

function MantineButtonLink({ ref, ...props }: MantineButtonLinkProps) {
  return <Button component="a" ref={ref} {...props} />;
}

export const ButtonLink: LinkComponent<typeof MantineButtonLink> =
  createLink(MantineButtonLink);
