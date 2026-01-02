import { useState } from 'react';
import { Button, Checkbox, Group, Modal, Stack, Text } from '@mantine/core';

interface PublishModalProps {
  opened: boolean;
  onClose: () => void;
  onConfirm: (requiresAcceptance: boolean) => void;
  isLoading?: boolean;
  documentVersion: string;
}

export function PublishModal({
  opened,
  onClose,
  onConfirm,
  isLoading,
  documentVersion,
}: PublishModalProps) {
  const [requiresAcceptance, setRequiresAcceptance] = useState(false);

  const handleConfirm = () => {
    onConfirm(requiresAcceptance);
  };

  const handleClose = () => {
    setRequiresAcceptance(false);
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="Publish Document"
      centered
    >
      <Stack gap="md">
        <Text size="sm">
          You are about to publish version <strong>{documentVersion}</strong>.
          Once published, this document cannot be edited or deleted.
        </Text>

        <Checkbox
          label="Require users to re-accept this version"
          checked={requiresAcceptance}
          onChange={(e) => setRequiresAcceptance(e.currentTarget.checked)}
        />

        <Group justify="flex-end" gap="sm">
          <Button
            variant="default"
            onClick={handleClose}
            disabled={isLoading}
            aria-label="Cancel publishing"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            loading={isLoading}
            aria-label={`Publish version ${documentVersion}`}
          >
            Publish
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
