import { Link } from '@tanstack/react-router';
import { AspectRatio, Button, Image, Modal, Stack, Title } from '@mantine/core';

import type { BrowseTemplate } from '../types';

interface TemplatePreviewModalProps {
  template: BrowseTemplate | null;
  opened: boolean;
  onClose: () => void;
}

export function TemplatePreviewModal({
  template,
  opened,
  onClose,
}: TemplatePreviewModalProps) {
  if (!template) return null;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="lg"
      title={<Title order={3}>{template.label}</Title>}
      centered
    >
      <Stack>
        <AspectRatio ratio={3 / 4} maw={400} mx="auto">
          <Image
            src={template.templateImage}
            alt={template.label}
            radius="md"
          />
        </AspectRatio>
        <Button component={Link} to="/create-card" size="lg" fullWidth>
          Use Template
        </Button>
      </Stack>
    </Modal>
  );
}
