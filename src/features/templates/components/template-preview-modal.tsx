import { Link } from '@tanstack/react-router';
import {
  ActionIcon,
  AspectRatio,
  Badge,
  Button,
  Drawer,
  Group,
  Image,
  Modal,
  Text,
  Title,
  useMantineTheme,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { Edit, Eye, PenLine, SlidersHorizontal, X } from 'lucide-react';

import { formatDate } from '@/utils/date';

import type { Template } from '../types';
import styles from './template-preview-modal.module.css';

interface TemplatePreviewModalProps {
  template: Template | null;
  opened: boolean;
  onClose: () => void;
}

export function TemplatePreviewModal({
  template,
  opened,
  onClose,
}: TemplatePreviewModalProps) {
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);

  if (!template) return null;

  const backTemplate = template.backTemplate ?? template.defaultBackTemplate;
  const isDefaultBack =
    !template.backTemplate && Boolean(template.defaultBackTemplate);

  const content = (
    <>
      <div className={styles.header}>
        <ActionIcon
          variant="transparent"
          size="lg"
          onClick={onClose}
          color="white"
          aria-label="Close"
        >
          <X size={24} />
        </ActionIcon>
        <Title order={3} className={styles.headerTitle}>
          TEMPLATE PREVIEW
        </Title>
        <div style={{ width: 36 }} />
      </div>

      <div className={styles.previewSection}>
        <div className={styles.previewCard}>
          <AspectRatio ratio={3 / 4}>
            <Image
              src={template.templateImage}
              alt={`${template.label} front`}
              fit="contain"
            />
          </AspectRatio>
        </div>

        {backTemplate && (
          <div
            className={`${styles.previewCard} ${isDefaultBack ? styles.previewCardDefault : ''}`}
          >
            <AspectRatio ratio={3 / 4}>
              <Image
                src={backTemplate.templateImage}
                alt={`${template.label} back`}
                fit="contain"
              />
            </AspectRatio>
          </div>
        )}
      </div>

      <div className={styles.actionsRow}>
        <Button
          component={Link}
          to={`/admin/templates/${template.id}`}
          variant="light"
          size={isMobile ? 'xs' : 'sm'}
          leftSection={<Eye size={14} />}
          onClick={onClose}
        >
          View
        </Button>
        <Button
          component={Link}
          to={`/admin/templates/${template.id}/edit`}
          variant="light"
          size={isMobile ? 'xs' : 'sm'}
          leftSection={<Edit size={14} />}
          onClick={onClose}
        >
          Edit
        </Button>
        <Button
          component={Link}
          to={`/admin/templates/${template.id}/annotate`}
          variant="light"
          size={isMobile ? 'xs' : 'sm'}
          leftSection={<PenLine size={14} />}
          onClick={onClose}
        >
          Annotate
        </Button>
        <Button
          component={Link}
          to={`/admin/templates/${template.id}/defaults`}
          variant="light"
          size={isMobile ? 'xs' : 'sm'}
          leftSection={<SlidersHorizontal size={14} />}
          onClick={onClose}
        >
          Defaults
        </Button>
      </div>

      <div className={styles.footer}>
        <Text size="sm" c="dimmed">
          {template.label}
        </Text>
        {template.tags.length > 0 && (
          <Group gap={4}>
            {template.tags.map((tag) => (
              <Badge key={tag.id} variant="light" size="xs">
                {tag.label}
              </Badge>
            ))}
          </Group>
        )}
        <Text size="sm" c="dimmed">
          Created: {formatDate(template.createdAt)}
        </Text>
      </div>
    </>
  );

  if (isMobile) {
    return (
      <Drawer
        opened={opened}
        onClose={onClose}
        position="bottom"
        size="75%"
        withCloseButton={false}
        classNames={{ content: styles.drawer }}
      >
        {content}
      </Drawer>
    );
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      withCloseButton={false}
      centered
      size="xl"
      classNames={{
        overlay: styles.overlay,
        content: styles.content,
        body: styles.body,
      }}
    >
      {content}
    </Modal>
  );
}
