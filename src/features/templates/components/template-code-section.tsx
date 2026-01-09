import { useState } from 'react';
import {
  Button,
  Card,
  Collapse,
  Group,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { ChevronDown, ChevronRight, Code } from 'lucide-react';

import { SvgPreview } from '@/components/svg-preview';

import { useTemplateFormContext } from './template-form-context';

export function TemplateCodeSection() {
  const [opened, setOpened] = useState(false);
  const form = useTemplateFormContext();

  return (
    <Card withBorder radius="md" p="lg">
      <Stack gap="md">
        <Group justify="space-between">
          <Title order={5}>Template Code</Title>
          <Button
            variant="subtle"
            size="xs"
            leftSection={
              opened ? <ChevronDown size={14} /> : <ChevronRight size={14} />
            }
            rightSection={<Code size={14} />}
            onClick={() => setOpened(!opened)}
          >
            {opened ? 'Hide' : 'Show'} SVG Code
          </Button>
        </Group>

        <Collapse in={opened}>
          <form.AppField name="svgString">
            {(field) => (
              <field.TextareaField
                placeholder="Paste SVG markup here..."
                rows={12}
                styles={{
                  input: {
                    fontFamily: 'monospace',
                    fontSize: '12px',
                    resize: 'vertical',
                  },
                }}
              />
            )}
          </form.AppField>
        </Collapse>

        {!opened && (
          <form.Subscribe selector={(state) => state.values.svgString}>
            {(svgString) => (
              <Text size="sm" c={svgString ? 'green' : 'dimmed'}>
                {svgString
                  ? `SVG loaded (${svgString.length.toLocaleString()} characters)`
                  : 'No SVG code entered'}
              </Text>
            )}
          </form.Subscribe>
        )}

        {/* Mobile-only inline preview */}
        <div className="lg:hidden">
          <Text size="sm" fw={500} mb={4}>
            Preview
          </Text>
          <form.Subscribe selector={(state) => state.values.svgString}>
            {(svgString) => (
              <SvgPreview
                svgString={svgString}
                height={200}
                className="w-full rounded-md border p-2"
                emptyMessage="Paste SVG to see preview"
              />
            )}
          </form.Subscribe>
        </div>
      </Stack>
    </Card>
  );
}
