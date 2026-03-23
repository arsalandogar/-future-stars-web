import {
  ActionIcon,
  Button,
  ColorPicker,
  Popover,
  Stack,
  Tooltip,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Eye, EyeOff } from 'lucide-react';

import type { EditableFieldId } from '@/features/templates';

import { useAnnotatorStore } from '../stores/annotator-store';
import { contrastColor } from '../utils/contrast-color';

const PREVIEW_SWATCHES = [
  '#2563eb',
  '#dc2626',
  '#16a34a',
  '#ea580c',
  '#9333ea',
  '#0891b2',
  '#ca8a04',
  '#db2777',
];

export function ColorPreviewPopover({
  fieldId,
  size = 'xs',
  iconSize = 12,
}: {
  fieldId: EditableFieldId;
  size?: 'xs' | 'sm';
  iconSize?: number;
}) {
  const setPreviewColor = useAnnotatorStore((s) => s.setPreviewColor);
  const previewColors = useAnnotatorStore((s) => s.previewColors);
  const previewColor = previewColors.get(fieldId)?.bg;
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <Popover
      opened={opened}
      onClose={close}
      position="bottom-end"
      shadow="md"
      width={240}
    >
      <Popover.Target>
        <Tooltip
          label={previewColor ? 'Change preview color' : 'Preview color area'}
          position="left"
          disabled={opened}
        >
          <ActionIcon
            variant={previewColor ? 'filled' : 'subtle'}
            color="violet"
            size={size}
            onClick={() => {
              if (previewColor) {
                setPreviewColor(fieldId, null);
                close();
              } else {
                open();
              }
            }}
            style={
              previewColor
                ? { backgroundColor: previewColor, border: 'none' }
                : undefined
            }
          >
            {previewColor ? (
              <Eye size={iconSize} />
            ) : (
              <EyeOff size={iconSize} />
            )}
          </ActionIcon>
        </Tooltip>
      </Popover.Target>
      <Popover.Dropdown p="sm">
        <Stack gap="xs">
          <ColorPicker
            format="hex"
            value={previewColor ?? '#2563eb'}
            onChange={(color) =>
              setPreviewColor(fieldId, {
                bg: color,
                fg: contrastColor(color),
              })
            }
            swatches={PREVIEW_SWATCHES}
            swatchesPerRow={8}
            size="sm"
            fullWidth
          />
          {previewColor && (
            <Button
              size="xs"
              variant="subtle"
              color="gray"
              onClick={() => {
                setPreviewColor(fieldId, null);
                close();
              }}
            >
              Clear preview
            </Button>
          )}
        </Stack>
      </Popover.Dropdown>
    </Popover>
  );
}
