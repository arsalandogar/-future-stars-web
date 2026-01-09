import { Card, Title } from '@mantine/core';

import { SvgPreview } from '@/components/svg-preview';

interface TemplatePreviewPanelProps {
  svgString: string;
}

export function TemplatePreviewPanel({ svgString }: TemplatePreviewPanelProps) {
  return (
    <Card withBorder radius="md" p="lg">
      <Title order={5} mb="md">
        Preview
      </Title>
      <SvgPreview
        svgString={svgString}
        className="w-full rounded-md border p-2"
        svgClassName="[&>svg]:max-h-[400px] [&>svg]:w-auto"
        emptyMessage="Paste SVG to see preview"
      />
    </Card>
  );
}
